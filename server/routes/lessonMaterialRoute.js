const express = require('express');
const lessonMaterialController = require('../controllers/lessonMaterialController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(lessonMaterialController.getAllLessonMaterials)
  .post(
    authController.restrictTo('teacher'),
    lessonMaterialController.uploadLessonMaterial,
    lessonMaterialController.createLessonMaterial
  );

router
  .route('/:id')
  .delete(
    authController.restrictTo('teacher'),
    lessonMaterialController.deleteLessonMaterial
  );

router.get('/download/:filename', lessonMaterialController.downloadLessonMaterial);

module.exports = router;