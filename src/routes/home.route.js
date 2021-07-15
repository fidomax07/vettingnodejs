const express = require('express');
const homeController = require('../controllers/home.controller');

const router = express.Router();

router.get('/', homeController.home);

router.get('/most-liked', homeController.mostLiked);

module.exports = router;
