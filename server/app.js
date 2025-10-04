const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');

const userRoutes = require('./routes/userRoutes');
const assignmentRoutes = require('./routes/assignmentRoute');
const quizRoutes = require('./routes/quizRoutes');
const videoRoutes = require('./routes/videoRoutes');
const classRoutes = require('./routes/classRoutes');
const studentRoutes = require('./routes/studentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const lessonMaterialRoutes = require('./routes/lessonMaterialRoute');

const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//global middlewares
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true
  })
);

//serving static files
app.use(express.static(path.join(__dirname, 'public')));

//body parser
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cookieParser());

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/assignments', assignmentRoutes);
app.use('/api/v1/quizzes', quizRoutes);
app.use('/api/v1/videos', videoRoutes);
app.use('/api/v1/class', classRoutes);
app.use('/api/v1/student', studentRoutes);
app.use('/api/v1/submissions', submissionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/v1/subjects', subjectRoutes);
app.use('/api/v1/lesson-materials', lessonMaterialRoutes);

app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'failed',
    message: `Can't find ${req.originalUrl} on this server`
  });
});

app.use(globalErrorHandler);
module.exports = app;
