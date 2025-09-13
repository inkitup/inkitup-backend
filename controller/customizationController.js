const Customization = require('../models/text');

const saveCustomization = async (req, res) => {
    try {
      // Check if this is a status-only update
      if (req.body.id && req.body.status && Object.keys(req.body).length === 2) {
        // Validate status
        const validStatuses = ['draft', 'saved', 'ordered'];
        if (!validStatuses.includes(req.body.status)) {
          return res.status(400).json({ error: 'Invalid status' });
        }
        
        const customization = await Customization.findById(req.body.id);
        
        if (!customization) {
          return res.status(404).json({ error: 'Customization not found' });
        }
        
        customization.status = req.body.status;
        await customization.save();
        
        return res.json({ 
          data: { 
            id: customization._id, 
            status: customization.status,
            message: 'Customization status updated successfully' 
          } 
        });
      }
      
      // For full customization save/update
      if (req.body.id) {
        // Update existing customization
        const customization = await Customization.findById(req.body.id);
        
        if (!customization) {
          return res.status(404).json({ error: 'Customization not found' });
        }
        
        // Check required fields
        if (!req.body.productId && !req.body.color && !req.body.customizations) {
          return res.status(400).json({ error: 'At least one field required to update' });
        }
        
        // Update fields that are provided
        if (req.body.productId) customization.productId = req.body.productId;
        if (req.body.color) customization.color = req.body.color;
        if (req.body.customizations) customization.customizations = req.body.customizations;
        if (req.body.orderId !== undefined) customization.orderId = req.body.orderId;
        if (req.body.userId !== undefined) customization.userId = req.body.userId;
        if (req.body.status) customization.status = req.body.status;
        if (req.body.renderedImages) customization.renderedImages = req.body.renderedImages;
        
        await customization.save();
        
        return res.json({ 
          data: { 
            id: customization._id,
            message: 'Customization updated successfully'
          } 
        });
      } else {
        // Create new customization - validate required fields
        if (!req.body.productId || !req.body.color || !req.body.customizations) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Create new customization with default empty renderedImages if not provided
        const customization = new Customization({
          productId: req.body.productId,
          color: req.body.color,
          customizations: req.body.customizations,
          renderedImages: req.body.renderedImages || {
            front: { imageId: '', imageUrl: '' },
            back: { imageId: '', imageUrl: '' }
          },
          orderId: req.body.orderId || null,
          userId: req.body.userId || null,
          status: req.body.status || 'draft'
        });
        
        await customization.save();
        
        return res.json({ 
          data: { 
            id: customization._id,
            message: 'Customization saved successfully'
          } 
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  };

const getCustomizations = async (req, res) => {
  try {
    const query = {};
    
    // Filter by userId if provided
    if (req.query.userId) {
      query.userId = req.query.userId;
    }
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by productId if provided
    if (req.query.productId) {
      query.productId = req.query.productId;
    }
    
    const result = await Customization.find(query);
    res.json({ data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getCustomizationById = async (req, res) => {
  try {
    const result = await Customization.findById(req.params.id);
    
    if (!result) {
      return res.status(404).json({ error: 'Customization not found' });
    }
    
    res.json({ data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const deleteCustomization = async (req, res) => {
  try {
    const customization = await Customization.findById(req.body.id);
    
    if (!customization) {
      return res.status(404).json({ error: 'Customization not found' });
    }
    
    await Customization.findByIdAndDelete(req.body.id);
    
    res.json({ 
      data: { 
        id: customization._id, 
        message: 'Customization deleted successfully' 
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  saveCustomization,
  getCustomizations,
  getCustomizationById,
  deleteCustomization
};