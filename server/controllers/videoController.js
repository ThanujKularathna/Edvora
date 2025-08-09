const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Video = require('../models/videoModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Configure multer for video uploads
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/videos');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `video-${req.user.id}-${Date.now()}.${ext}`);
  }
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video')) {
    cb(null, true);
  } else {
    cb(new AppError('Not a video! Please upload only videos.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

exports.uploadVideo = upload.single('video');

exports.createVideo = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload a video file', 400));
  }

  const { title, subject, class: className } = req.body;

  if (!title || !subject || !className) {
    return next(new AppError('Title, subject, and class are required', 400));
  }

  const newVideo = await Video.create({
    title,
    subject,
    fileName: req.file.filename,
    url: `/api/v1/videos/stream`,
    teacherId: req.user.id, // Use authenticated user's ID
    class: className
  });

  res.status(201).json({
    status: 'success',
    data: newVideo
  });
});

exports.getVideosByClass = catchAsync(async (req, res, next) => {
  const { className } = req.params;

  const videos = await Video.find({ class: className }).populate('teacherId', 'name');

  res.status(200).json({
    status: 'success',
    results: videos.length,
    data: videos
  });
});

exports.streamVideo = catchAsync(async (req, res, next) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    return next(new AppError('No video found with that ID', 404));
  }

  const videoPath = path.join(__dirname, '..', 'public', 'videos', video.fileName);

  if (!fs.existsSync(videoPath)) {
    return next(new AppError('Video file not found', 404));
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});

exports.deleteVideo = catchAsync(async (req, res, next) => {
  const video = await Video.findByIdAndDelete(req.params.id);

  if (!video) {
    return next(new AppError('No video found with that ID', 404));
  }

  // Delete the video file from the filesystem
  if (video.fileName) {
    const videoPath = path.join(__dirname, '..', 'public', 'videos', video.fileName);
    
    try {
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
        console.log(`Video file ${video.fileName} deleted successfully`);
      }
    } catch (error) {
      console.error('Error deleting video file:', error);
      // Don't fail the request if file deletion fails
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Video deleted successfully'
  });
});