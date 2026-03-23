const express = require('express');
const router = express.Router();
const {
    loginUser,
    registerUser,
    refreshAccessToken,
    logoutUser,
    logoutAllDevices,
    getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate, loginSchema, registerSchema, refreshTokenSchema } = require('../middleware/validation');

// Public routes
router.post('/login', validate(loginSchema), loginUser);
router.post('/register', validate(registerSchema), registerUser);
router.post('/refresh', validate(refreshTokenSchema), refreshAccessToken);
router.post('/logout', logoutUser);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout-all', protect, logoutAllDevices);

module.exports = router;
