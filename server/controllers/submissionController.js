const multer = require('multer');
const util = require('util');
const fs = require('fs');
const catchAsync = require('../utils/catchAsync');
const Submission = require('../models/submissionModel');
const Assignment = require('../models/assignmentModel');
const AppError = require('../utils/appError');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/submissions');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    const realName = file.originalname.split('.')[0];
    cb(null, `submission-${req.user.id}-${Date.now()}.${ext}`);
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
  limits: { fileSize: 5242880 }, // 5MB
  fileFilter: multerFilter
});

exports.uploadSubmission = upload.single('pdf');

exports.submitHomework = catchAsync(async (req, res, next) => {
  const { assignmentId } = req.params;

  // Check if assignment exists
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    return next(new AppError('Assignment not found', 404));
  }

  // Check if deadline has passed
  if (assignment.deadline && new Date() > assignment.deadline) {
    return next(new AppError('Assignment deadline has passed', 400));
  }

  // Check if student already submitted
  const existingSubmission = await Submission.findOne({
    student: req.user.id,
    assignment: assignmentId
  });

  if (existingSubmission) {
    return next(
      new AppError('You have already submitted this assignment', 400)
    );
  }

  if (!req.file) {
    return next(new AppError('Please upload a PDF file', 400));
  }

  const submission = await Submission.create({
    student: req.user.id,
    assignment: assignmentId,
    fileName: req.file.filename,
    originalFileName: req.file.originalname
  });

  res.status(201).json({
    status: 'success',
    data: submission
  });
});

exports.getMySubmission = catchAsync(async (req, res, next) => {
  const { assignmentId } = req.params;

  const submission = await Submission.findOne({
    student: req.user.id,
    assignment: assignmentId
  });

  res.status(200).json({
    status: 'success',
    data: submission
  });
});

exports.downloadSubmission = catchAsync(async (req, res, next) => {
  const { filename } = req.params;
  const filePath = `${__dirname}/../public/submissions/${filename}`;

  try {
    await util.promisify(fs.access)(filePath, fs.constants.F_OK);
  } catch (error) {
    return next(new AppError('File not found', 404));
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=${filename}`);

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});
