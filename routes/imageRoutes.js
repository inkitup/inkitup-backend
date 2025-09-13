const express = require('express');
const imageController = require('../controller/imageController');
const { upload } = require('../config/s3.config');
const router = express.Router();
const auth = require('../middleware/auth');

router.post('/upload',auth, upload.single('file'), imageController.uploadImage);

router.get('/getimages', imageController.getImages);

router.get('/:id', imageController.getImageById);

router.post('/delete', imageController.deleteImage);

module.exports = router;