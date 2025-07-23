const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'assignment must have a title']
  },

  teacher: {
    type: String,
    required: [true, 'assignment must be belong to a teacher']
  },

  fileName: {
    type: String,
    required: [true, 'assignment must have a file name']
  },
  description: String,

  originalFileName: String,

  createdAt: {
    type: Date,
    default: Date.now
  },

  deadline: {
    type: Date
  },
  class: {
    type: String,
    required: [true, 'Assignment must belong to a class']
  },
  subject: {
    type: String,
    required: [true, 'Assignment must have a subject']
  }
});

assignmentSchema.methods.isDeadlineExtended = function (newDeadline) {
  // console.log(newDeadline);
  // console.log(this.deadline);
  const existingDeadline = parseInt(this.deadline.getTime(), 10); // from the current document
  const compareDate = parseInt(new Date(newDeadline).getTime(), 10);

  if (Number.isNaN(compareDate)) return false;

  console.log(compareDate, existingDeadline);

  return compareDate > existingDeadline;
};

const Assignment = mongoose.model('Assignment', assignmentSchema);
module.exports = Assignment;
