const mongoose = require('mongoose');

// Schema for individual questions
const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (arr) => arr.length === 4,
      message: 'four options must be needed for a question'
    }
  },
  correctAnswerIndex: {
    type: Number,
    required: true,
    validate: {
      validator: function (val) {
        return this.options[val] !== undefined;
      },
      message: 'Correct answer index must match an option'
    }
  },
  marks: {
    type: Number,
    default: 1
  },
  type: {
    type: String,
    enum: ['mcq'],
    default: 'mcq'
  }
});
module.exports = questionSchema;
