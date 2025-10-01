const multer = require('multer');
const util = require('util');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const catchAsync = require('../utils/catchAsync');
const Assignment = require('../models/assignmentModel');
const Submission = require('../models/submissionModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const { logActivity } = require('../utils/activityLogger');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/pdf');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    const realName = file.originalname.split('.')[0];
    cb(null, `assignment-${realName}-${Date.now()}.${ext}`);
  }
});

const multerFilter = function (req, file, cb) {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF files are allowed!'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 3145728 }, // 10MB in bytes
  fileFilter: multerFilter
});

exports.uploadAssignment = upload.single('pdf');

exports.getAllAssignments = catchAsync(async (req, res, next) => {
  const filter = {};

  if (req.query.class) filter.class = req.query.class;

  if (req.user && req.user.role === 'teacher') {
    filter.teacher = req.user.id;
  }

  const assignments = await Assignment.find(filter).populate({
    path: 'subject',
    select: 'name'
  });

  // Add download URL to each assignment and ensure id property exists
  const assignmentsWithUrls = assignments.map((assignment) => {
    const assignmentObj = assignment.toObject();
    // Ensure there's an id property that matches what frontend expects
    assignmentObj.id = assignmentObj._id;
    if (assignmentObj.fileName) {
      assignmentObj.downloadUrl = `/api/v1/assignments/download/${assignmentObj.fileName}`;
    }
    return assignmentObj;
  });

  return res.status(200).json({
    status: 'success',
    results: assignmentsWithUrls.length,
    data: assignmentsWithUrls
  });
});

exports.createAssignment = catchAsync(async (req, res, next) => {
  console.log(req.body);
  req.body.teacher = req.user.id;

  if (req.file) {
    // console.log(req.file);
    req.body.fileName = req.file.filename;
    req.body.originalFileName = req.file.originalname;
  }

  if (req.body.deadline) {
    // Parse the YYYY-MM-DD format
    const newDeadline = new Date(req.body.deadline);
    if (Number.isNaN(newDeadline)) {
      return next(new AppError('Invalid deadline format', 400));
    }

    if (newDeadline < new Date()) {
      return next(new AppError('Deadline must be in the future', 400));
    }

    req.body.deadline = newDeadline;
  }
  const assignment = await Assignment.create(req.body);

  // Log assignment creation activity
  await logActivity(
    req.user._id,
    'Assignment Created',
    `Created assignment: ${assignment.title}`,
    req
  );

  // Send notification to all users
  // sendAssignmentNotification(req, assignment);

  console.log(assignment);
  return res.status(201).json({
    status: 'success',
    data: assignment
  });
});

exports.updateAssignment = catchAsync(async (req, res, next) => {
  if (req.file) {
    req.body.fileName = req.file.filename;
    req.body.originalFileName = req.file.originalname;
  }

  // Validate and compare deadline BEFORE updating
  if (req.body.deadline) {
    const newDeadline = new Date(req.body.deadline);
    if (Number.isNaN(newDeadline)) {
      return next(new AppError('Invalid deadline format', 404));
    }

    //Find the assignment first (NOT update yet)
    const currentAssignment = await Assignment.findById(req.params.id);
    if (!currentAssignment) {
      return next(new AppError('No assignment found with that ID', 404));
    }

    //Compare with existing deadline
    if (!currentAssignment.isDeadlineExtended(newDeadline)) {
      return next(
        new AppError('New deadline must be after existing deadline', 404)
      );
    }

    //Replace raw string with validated date object
    req.body.deadline = newDeadline;
  }

  //Perform the actual update
  const assignment = await Assignment.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  // Log assignment update activity
  await logActivity(
    req.user._id,
    'Assignment Updated',
    `Updated assignment: ${assignment.title}`,
    req
  );

  return res.status(200).json({
    status: 'success',
    data: assignment
  });
});

exports.deleteAssignment = catchAsync(async (req, res, next) => {
  const assignment = await Assignment.findByIdAndDelete(req.params.id);

  if (!assignment) {
    return next(new AppError('No assignment found with that ID', 404));
  }

  // Log assignment deletion activity
  await logActivity(
    req.user._id,
    'Assignment Deleted',
    `Deleted assignment: ${assignment.title}`,
    req
  );

  //Deleting assignment file from the directory
  if (assignment.fileName) {
    const filePath = `public/pdf/${assignment.fileName}`;

    try {
      await util.promisify(fs.unlink)(filePath);
      console.log(`File ${filePath} has been successfully removed.`);
    } catch (err) {
      console.log(err);
      return next(new AppError('Error deleting file', 500));
    }
  }

  return res.status(200).json({
    status: 'success',
    data: null
  });
});

/**
 * Download assignment PDF file
 * @route GET /api/v1/assignments/download/:filename
 */
exports.downloadAssignment = catchAsync(async (req, res, next) => {
  const { filename } = req.params;
  const filePath = `${__dirname}/../public/pdf/${filename}`;

  // Check if file exists
  try {
    await util.promisify(fs.access)(filePath, fs.constants.F_OK);
  } catch (error) {
    return next(new AppError('File not found', 404));
  }

  // Log assignment download activity
  if (req.user) {
    await logActivity(
      req.user._id,
      'Assignment Downloaded',
      `Downloaded assignment file: ${filename}`,
      req
    );
  }

  // Set headers for PDF viewing in browser (not downloading)
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=${filename}`);

  // Stream the file to the response
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

/**
 * Get all submissions for a specific assignment (for teachers)
 * @route GET /api/v1/assignments/:id/submissions
 */
exports.getAssignmentSubmissions = catchAsync(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return next(new AppError('Assignment not found', 404));
  }

  // Check if the teacher owns this assignment
  if (assignment.teacher.toString() !== req.user.id) {
    return next(
      new AppError(
        'You can only view submissions for your own assignments',
        403
      )
    );
  }

  const submissions = await Submission.find({ assignment: req.params.id });

  res.status(200).json({
    status: 'success',
    results: submissions.length,
    data: submissions
  });
});

/**
 * Download all submissions for an assignment as a zip file
 * @route GET /api/v1/assignments/:id/submissions/download
 */
exports.downloadSubmissionsZip = catchAsync(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return next(new AppError('Assignment not found', 404));
  }

  // Check if the teacher owns this assignment

  console.log(assignment.teacher._id.toString());
  if (assignment.teacher_id !== req.user_id) {
    return next(
      new AppError(
        'You can only download submissions for your own assignments',
        403
      )
    );
  }

  // Get all submissions for this assignment with student details
  const submissions = await Submission.find({
    assignment: req.params.id
  }).populate('student', 'name email');

  if (submissions.length === 0) {
    return next(new AppError('No submissions found for this assignment', 404));
  }

  // Create zip filename
  const zipFilename = `${assignment.title.replace(/[^a-zA-Z0-9]/g, '_')}_submissions.zip`;

  // Set response headers for zip download
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);

  // Create archiver instance
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  // Handle archiver errors
  archive.on('error', (err) => {
    console.error('Archive error:', err);
    return next(new AppError('Error creating zip file', 500));
  });

  // Pipe archive to response
  archive.pipe(res);

  // Add each submission file to the zip
  for (const submission of submissions) {
    const submissionPath = path.join(
      __dirname,
      '../public/submissions',
      submission.fileName
    );

    try {
      // Check if file exists
      await util.promisify(fs.access)(submissionPath, fs.constants.F_OK);

      // Create a readable name for the file in the zip
      const studentName = submission.student.name.replace(/[^a-zA-Z0-9]/g, '_');
      const fileExtension = path.extname(submission.fileName);
      const zipEntryName = `${studentName}_${submission.student.email}${fileExtension}`;

      // Add file to zip
      archive.file(submissionPath, { name: zipEntryName });
    } catch (error) {
      console.error(`File not found: ${submissionPath}`);
      // Continue with other files even if one is missing
    }
  }

  // Log download activity
  await logActivity(
    req.user._id,
    'Submissions Downloaded',
    `Downloaded ${submissions.length} submissions for assignment: ${assignment.title}`,
    req
  );

  // Finalize the zip file
  archive.finalize();
});
