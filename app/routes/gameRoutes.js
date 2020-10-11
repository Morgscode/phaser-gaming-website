const express = require('express');
const gameController = require('../controllers/gameController');

const router = express.Router();

router.route('/:game').get(gameController.getGameByRequestPath);

module.exports = router;
