// const mongoose = require('mongoose');

// const classSchema = new mongoose.Schema({
//   grade: {
//     type: String,
//     require: [true, 'Class must have a grade']
//   },

//   className: {
//     type: String,
//     require: [true, 'class must have a name'],
//     unique: true
//   },

//   students: [
//     {
//       type: String,
//       require: [true, 'Class must have students']
//     }
//   ],
//   teachers: [
//     {
//       type: String,
//       require: [true, 'Class must have teachers']
//     }
//   ],
//   subjects: [
//     {
//       type: String
//     }
//   ],

//   lectureMaterial: [
//     {
//       type: String
//     }
//   ],

//   lectureVideos: [
//     {
//       type: String
//     }
//   ],

//   assignments: [
//     {
//       type: String
//     }
//   ]
// });

// const Class = mongoose.model('Class', classSchema);
// module.exports = Class;
