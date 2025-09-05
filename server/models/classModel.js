const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  className: {
    type: String,
    require: [true, 'class must have a name'],
    unique: true
  },

  students: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      require: [true, 'Class must have students']
    }
  ],
  teachers: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      require: [true, 'Class must have teachers']
    }
  ],
  subjects: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Subject',
      require: [true, 'Class must have subjects']
    }
  ],

  lectureMaterial: [
    {
      type: String
    }
  ],

  lectureVideos: [
    {
      type: String
    }
  ],

  assignments: [
    {
      type: String
    }
  ]
});

classSchema.pre(/^find/, function (next) {
  this.populate([
    {
      path: 'students',
      select: 'name email '
    },
    {
      path: 'teachers',
      select: 'name email'
    },
    {
      path: 'subjects',
      select: 'name'
    }
  ]);
  next();
});

const Class = mongoose.model('Class', classSchema);
module.exports = Class;

// mongoose.Schema.ObjectId
