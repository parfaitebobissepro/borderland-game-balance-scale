const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const {
    roomService,
} = require('../services');


const createRoom = catchAsync(async(req, res) => {
    const room = await roomService.createRoom(req.body);
    res.status(httpStatus.CREATED).send(room);
});
const getRooms = catchAsync(async(req, res) => {
    const rooms = await roomService.queryRooms();
    res.status(httpStatus.CREATED).send(rooms);
});
const getRoom = catchAsync(async(req, res) => {
    const room = await roomService.getRoomByIdRoomId(req.params.roomId);
    console.log(room.toJSON());
    res.status(httpStatus.CREATED).send(room);
});

module.exports = {
    createRoom,
    getRooms,
    getRoom
}