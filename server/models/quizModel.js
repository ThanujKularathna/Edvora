const mongoose = require('mongoose');
const questionSchema = require('./questionModel');

// Main Quiz schema
const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  teacherId: {
    // type: mongoose.Schema.Types.ObjectId,
    // ref: 'User', // assuming your teacher model is in 'User'
    // required: true
    type: String,
    required: true
  },
  // grade: {
  //   type: Number,
  //   required: true
  // },
  class: {
    type: String, // e.g. 'A', 'B', 'C'
    required: true
  },
  subject: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subject',
    required: true
  },
  questions: {
    type: [questionSchema],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  deadline: {
    type: Date // optional deadline
  },
  totalMarks: {
    type: Number
  }
});

// Pre-save middleware to calculate totalMarks and convert deadline
quizSchema.pre('save', function (next) {
  this.totalMarks = this.questions.reduce((sum, q) => sum + (q.marks || 1), 0);

  // Convert deadline from YYYY-MM-DD format to Date object
  if (this.deadline && typeof this.deadline === 'string') {
    this.deadline = new Date(this.deadline);
  }

  next();
});

module.exports = mongoose.model('Quiz', quizSchema);
