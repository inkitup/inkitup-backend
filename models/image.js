const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    entityId: {
      type: String,
      required: false
    },
    entityType: {
      type: String,
      required: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    userEmail: {
      type: String,
      required: false
    },
    updatedBy: {
      type: String,
      required: false
    }
  },
  {
    timestamps: { 
      createdAt: 'createdOn', 
      updatedAt: 'updatedOn' 
    }
  }
);

module.exports = mongoose.model('Image', imageSchema);