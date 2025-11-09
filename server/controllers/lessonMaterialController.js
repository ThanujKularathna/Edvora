const multer = require('multer');
const util = require('util');
const fs = require('fs');
const catchAsync = require('../utils/catchAsync');
const LessonMaterial = require('../models/lessonMaterialModel');
const AppError = require('../utils/appError');
const { logActivity } = require('../utils/activityLogger');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/lesson-materials');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    const realName = file.originalname.split('.')[0];
    cb(null, `lesson-${realName}-${Date.now()}.${ext}`);
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
  limits: { fileSize: 10485760 }, // 10MB
  fileFilter: multerFilter
});

exports.uploadLessonMaterial = upload.single('pdf');

exports.getAllLessonMaterials = catchAsync(async (req, res, next) => {
  const filter = {};

  if (req.query.class) filter.class = req.query.class;
  if (req.query.subject) filter.subject = req.query.subject;

  // For teachers, show only their own materials for the specific class
  if (req.user && req.user.role === 'teacher') {
    filter.teacher = req.user.id;
    // If class is specified in query, filter by that class only
    if (req.query.class) {
      filter.class = req.query.class;
    }
  }
  // Students can see all materials (no additional filter)

  const materials = await LessonMaterial.find(filter)
    .populate({
      path: 'subject',
      select: 'name'
    })
    .populate({
      path: 'teacher',
      select: 'name'
    });

  const materialsWithUrls = materials.map((material) => {
    const materialObj = material.toObject();
    materialObj.id = materialObj._id;
    if (materialObj.fileName) {
      materialObj.downloadUrl = `/api/v1/lesson-materials/download/${materialObj.fileName}`;
    }
    return materialObj;
  });

  return res.status(200).json({
    status: 'success',
    results: materialsWithUrls.length,
    data: materialsWithUrls
  });
});

exports.createLessonMaterial = catchAsync(async (req, res, next) => {
  req.body.teacher = req.user.id;

  if (req.file) {
    req.body.fileName = req.file.filename;
    req.body.originalFileName = req.file.originalname;
  }

  const material = await LessonMaterial.create(req.body);

  // Populate the created material with subject and teacher data
  await material.populate([
    { path: 'subject', select: 'name' },
    { path: 'teacher', select: 'name' }
  ]);

  await logActivity(
    req.user._id,
    'Lesson Material Created',
    `Created lesson material: ${material.title}`,
    req
  );

  // Add download URL
  const materialObj = material.toObject();
  materialObj.id = materialObj._id;
  if (materialObj.fileName) {
    materialObj.downloadUrl = `/api/v1/lesson-materials/download/${materialObj.fileName}`;
  }

  return res.status(201).json({
    status: 'success',
    data: materialObj
  });
});

exports.deleteLessonMaterial = catchAsync(async (req, res, next) => {
  const material = await LessonMaterial.findByIdAndDelete(req.params.id);

  if (!material) {
    return next(new AppError('No lesson material found with that ID', 404));
  }

  await logActivity(
    req.user._id,
    'Lesson Material Deleted',
    `Deleted lesson material: ${material.title}`,
    req
  );

  if (material.fileName) {
    const filePath = `public/lesson-materials/${material.fileName}`;
    try {
      await util.promisify(fs.unlink)(filePath);
    } catch (err) {
      console.log(err);
    }
  }

  return res.status(200).json({
    status: 'success',
    data: null
  });
});

exports.downloadLessonMaterial = catchAsync(async (req, res, next) => {
  const { filename } = req.params;
  const filePath = `${__dirname}/../public/lesson-materials/${filename}`;

  try {
    await util.promisify(fs.access)(filePath, fs.constants.F_OK);
  } catch (error) {
    return next(new AppError('File not found', 404));
  }

  if (req.user) {
    await logActivity(
      req.user._id,
      'Lesson Material Downloaded',
      `Downloaded lesson material: ${filename}`,
      req
    );
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=${filename}`);

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});
