const mongoose = require('mongoose');

const customizationSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true
    },
    customizations: [{
      id: String,
      type: {
        type: String,
        enum: ['text', 'sticker'],
        required: true
      },
      content: String,
      color: String,
      fontSize: Number,
      position: {
        x: Number,
        y: Number
      },
      rotation: Number,
      size: {
        width: Number,
        height: Number
      },
      side: {
        type: String,
        enum: ['front', 'back'],
        default: 'front'
      }
    }],
    renderedImages: {
      front: {
        imageId: String,
        imageUrl: String
      },
      back: {
        imageId: String,
        imageUrl: String
      }
    },
    orderId: {
      type: String,
      required: false
    },
    userId: {
      type: String,
      required: false
    },
    status: {
      type: String, 
      enum: ['draft', 'saved', 'ordered'],
      default: 'draft'
    }
  },
  {
    timestamps: { 
      createdAt: 'createdOn', 
      updatedAt: 'updatedOn' 
    }
  }
);

module.exports = mongoose.model('Customization', customizationSchema);