const crypto = require('crypto');
const bcrypt = require('bcrypt');
const validator = require('validator');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User must have a name']
  },

  role: {
    type: String,
    required: true,
    enum: ['student', 'teacher', 'admin']
  },

  password: {
    type: String,
    required: [true, 'User must have a password'],
    minlength: 8,
    select: false
  },

  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password'],
    validate: {
      //this only works on create and save
      validator: function (el) {
        return el === this.password;
      },
      message: 'passwords are not the same'
    }
  },

  photo: {
    type: String,
    default: 'default.jpg'
  },
  gender: {
    type: String,
    // required: [true, "a user should have a gender"],
    enum: ['male', 'female']
  },

  email: {
    type: String,
    required: [true, 'User must have a email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'PLease provide a valid email']
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,

  classes: {
    type: mongoose.Schema.Types.Mixed,
    validate: {
      validator: function (value) {
        if (this.role === 'admin') {
          return !value;
        }
        if (this.role === 'student') {
          return typeof value === 'string';
        }
        if (this.role === 'teacher') {
          return Array.isArray(value);
        }
        return true;
      },
      message:
        'Admins cannot have classes. Students must have one class (string), teachers must have multiple classes (array)'
    }
  },
  subjects: {
    type: [String],
    validate: {
      validator: function (value) {
        if (this.role === 'admin') {
          return !value || value.length === 0;
        }
        return true;
      },
      message: 'Admins cannot have subjects'
    }
  }
});

userSchema.pre('save', async function (next) {
  // Only hash if password is new or modified
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);
  this.passwordConfirm = undefined;
  console.log('hashed');
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    console.log('changed password after');

    return JWTTimestamp < changedTimestamp;
  }
  // False means NOT changed
  return false;
};

userSchema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
userSchema.set('toJSON', {
  transform: function (doc, ret) {
    if (ret.role === 'admin') {
      delete ret.subjects;
      delete ret.classes;
    }
    return ret;
  }
});
const User = mongoose.model('User', userSchema);
module.exports = User;
