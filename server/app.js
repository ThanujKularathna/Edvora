const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');

const userRoutes = require('./routes/userRoutes');
const assignmentRoutes = require('./routes/assignmentRoute');
const quizRoutes = require('./routes/quizRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//global middlewares
app.use(cors());

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
app.use('/api/v1/notifications', notificationRoutes);

// Serve notifications test page
app.get('/notifications', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'notifications.html'));
});

app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'failed',
    message: `Can't find ${req.originalUrl} on this server`
  });
});

app.use(globalErrorHandler);
module.exports = app;
