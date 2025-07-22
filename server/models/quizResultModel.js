const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Quiz',
      required: [true, 'Quiz result must belong to a quiz']
    },
    studentId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Quiz result must belong to a student']
    },
    answers: [
      {
        questionId: String,
        selectedOption: Number,
        isCorrect: Boolean
      }
    ],
    score: {
      type: Number,
      required: [true, 'Quiz result must have a score']
    },
    totalQuestions: {
      type: Number,
      required: [true, 'Quiz result must have total questions']
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for faster queries
quizResultSchema.index({ quizId: 1, studentId: 1 }, { unique: true });

const QuizResult = mongoose.model('QuizResult', quizResultSchema, 'quizResult');

module.exports = QuizResult;
