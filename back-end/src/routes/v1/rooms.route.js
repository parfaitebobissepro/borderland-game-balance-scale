const express = require('express');
const { roomController } = require('../../controllers');

const router = express.Router();

router
    .route('/')
    .post(roomController.createRoom)
    .get(roomController.getRooms);

router
    .route('/:roomId')
    .get(roomController.getRoom);

module.exports = router;