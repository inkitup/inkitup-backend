const Image = require('../models/image');
const User = require('../models/user');

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const file = req.file;
    let userId, userEmail;
    
    if (req.user && req.user.userId) {
      userId = req.user.userId;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      userEmail = user.email;
    }
    // Create new image record in MongoDB
    const image = new Image({
      fileName: file.originalname,
      fileUrl: file.location, // S3 file URL
      fileType: file.mimetype,
      fileSize: file.size,
      entityId: req.body.entityId || null,
      entityType: req.body.entityType || null,
      createdBy: userId,
      userEmail: userEmail || null
    });
    
    
    const result = await image.save();
    
    res.json({ 
      data: { 
        id: result.id, 
        fileUrl: result.fileUrl,
        message: 'Image uploaded successfully' 
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getImages = async (req, res) => {
  try {
    const query = {};
    
    // Filter by entityId if provided
    if (req.query.entityId) {
      query.entityId = req.query.entityId;
    }
    
    // Filter by entityType if provided
    if (req.query.entityType) {
      query.entityType = req.query.entityType;
    }
    
    if (req.query.userEmail) {
      query.userEmail = req.query.userEmail;
    }
    if (req.query.myImages === 'true' && req.user) {
      const user = await User.findById(req.user.userId);
      if (user) {
        query.userEmail = user.email;
      }
    }
    const result = await Image.find(query);
    res.json({ data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getImageById = async (req, res) => {
  try {
    const result = await Image.findById(req.params.id);
    
    if (!result) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    res.json({ data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const deleteImage = async (req, res) => {
  try {
    const image = await Image.findById(req.body.id);
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }
    if (req.user && image.createdBy && req.user.userId !== image.createdBy.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this image' });
    }
    const urlParts = image.fileUrl.split('/');
    const key = urlParts.slice(3).join('/');
    
    const { s3 } = require('../config/s3.config');
    await s3.deleteObject({
      Bucket: process.env.S3_BUCKET_NAME || 'linkitupbucket',
      Key: key
    }).promise();
    
    await Image.findByIdAndDelete(req.body.id);
    
    res.json({ data: { id: image._id, message: 'Image deleted successfully' } });
  } catch (error) {
    console.error(error);
    res.status(500) .json({ error: error.message });
  }
};

module.exports = {
  uploadImage,
  getImages,
  getImageById,
  deleteImage
};