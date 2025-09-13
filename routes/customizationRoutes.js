const express = require('express');
const customizationController  = require('../controller/customizationController');
const router = express.Router();

router.post('/save', customizationController.saveCustomization);
router.get('/get', customizationController.getCustomizations);
router.get('/:id', customizationController.getCustomizationById);
router.delete('/delete', customizationController.deleteCustomization);

module.exports = router;