const mongoose = require('mongoose');

const lessonMaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for the lesson material'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  fileName: {
    type: String,
    required: [true, 'File name is required']
  },
  originalFileName: {
    type: String,
    required: [true, 'Original file name is required']
  },
  teacher: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Lesson material must belong to a teacher']
  },
  subject: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subject',
    required: [true, 'Please specify the subject']
  },
  class: {
    type: String,
    required: [true, 'Please specify the class']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const LessonMaterial = mongoose.model('LessonMaterial', lessonMaterialSchema);

module.exports = LessonMaterial;