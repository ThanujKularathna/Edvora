const Subject = require('../models/subjectModel');
const User = require('../models/userModel');
const Class = require('../models/classModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllSubjects = catchAsync(async (req, res, next) => {
  const subjects = await Subject.find();
  
  res.status(200).json({
    status: 'success',
    results: subjects.length,
    data: {
      subjects
    }
  });
});

exports.createSubject = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  
  if (!name) {
    return next(new AppError('Subject name is required', 400));
  }

  // Check if subject already exists
  const existingSubject = await Subject.findOne({ name: name.trim() });
  if (existingSubject) {
    return next(new AppError('Subject already exists', 400));
  }

  const newSubject = await Subject.create({ name: name.trim() });
  
  res.status(201).json({
    status: 'success',
    data: {
      subject: newSubject
    }
  });
});

exports.deleteSubject = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const subject = await Subject.findById(id);
  
  if (!subject) {
    return next(new AppError('No subject found with that ID', 404));
  }
  
  // Remove subject from all teachers
  await User.updateMany(
    { role: 'teacher', subjects: id },
    { $pull: { subjects: id } }
  );
  
  // Remove subject from all classes
  await Class.updateMany(
    { subjects: id },
    { $pull: { subjects: id } }
  );
  
  // Delete the subject
  await Subject.findByIdAndDelete(id);
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});