const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Video title is required'],
    trim: true
  },
  fileName: {
    type: String,
    required: [true, 'Video file name is required']
  },
  url: {
    type: String,
    required: [true, 'Video URL is required']
  },
  teacherId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Teacher ID is required']
  },
  class: {
    type: String,
    required: [true, 'Class is required']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required']
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;