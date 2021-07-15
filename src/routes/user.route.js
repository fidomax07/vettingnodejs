const express = require('express');
const auth = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

const router = express.Router();

router.get('/:id', userController.show);

router.post('/:id/like', auth, userController.like);

router.post('/:id/unlike', auth, userController.unlike);

module.exports = router;
