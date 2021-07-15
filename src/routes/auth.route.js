const express = require('express');
const auth = require('../middleware/auth.middleware');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.post('/signup', authController.signup);

router.post('/login', authController.login);

router.post('/logout', auth, authController.logout);

router.get('/me', auth, authController.profile);

router.put('/me/update-password', auth, authController.updatePassword);

module.exports = router;
