const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  uploadProfilePicture,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate, validationRules } = require('../middleware/validator');
const upload = require('../middleware/upload');

router.post('/register', validationRules.register, validate, register);
router.post('/login', validationRules.login, validate, login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, validationRules.updateProfile, validate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.post('/profile-picture', authenticate, upload.single('profilePicture'), uploadProfilePicture);

module.exports = router;
