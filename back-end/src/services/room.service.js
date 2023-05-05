const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const Room = require('../models/room.model');
const Step = require('../models/step.model');
const User = require('../models/user.model');

const createRoom = (roomBody) => {
    return Room.create(roomBody);
}
const queryRooms = () => {
    return Room.find();
}
const getRoomById = async(id) => {
    return await Room.findById(id).populate({
        path: "steps",
        populate: {
            path: "users"
        }
    });
}
const getRoomByIdRoomId = async(roomId) => {
    let room = await Room.findOne({ roomId: roomId })
        .populate({
            path: 'steps',
            populate: { path: 'users' }
        });
    room.actualServerDate = new Date(Date.now());
    return room;
}
const updateRoomById = async(roomId, updateBody) => {
    const room = await getRoomById(roomId);
    if (!room) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Room not found');
    }
    Object.assign(room, updateBody);
    await room.save();
    return room;
}

module.exports = {
    createRoom,
    queryRooms,
    getRoomById,
    getRoomByIdRoomId,
    updateRoomById
}