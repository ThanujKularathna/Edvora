const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Submission must belong to a student']
  },
  assignment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Assignment',
    required: [true, 'Submission must be for an assignment']
  },
  fileName: {
    type: String,
    required: [true, 'Submission must have a file']
  },
  originalFileName: {
    type: String,
    required: [true, 'Submission must have original file name']
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate submissions
submissionSchema.index({ student: 1, assignment: 1 }, { unique: true });

submissionSchema.pre(/^find/, function (next) {
  this.populate({ path: 'student', select: 'name' })
       .populate({ path: 'assignment', select: 'title deadline' });
  next();
});

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;