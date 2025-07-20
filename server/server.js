const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');

dotenv.config({ path: './config.env' });
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! SHUTTING DOWN..');
  console.log(err.name, err.message);
  process.exit(1);
});
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log('DB connection successful');
});

const port = process.env.PORT || 3000;
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available globally
app.set('io', io);

server.listen(port, () => {
  console.log(`app running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLE REJECTION! SHUTTING DOWN'); //if data base not connected succefully this can be done.
  server.close(() => {
    process.exit(1);
  });
});
