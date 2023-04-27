const httpStatus = require('http-status');
const UtilFunctions = require('../utils/functions');
const catchAsync = require('../utils/catchAsync');


let rooms = [];

const register = catchAsync(async(req, res) => {

});

const createRoom = ({
    io,
    socket
} = {}) => {
    socket.on('createRoom', (name) => {
        let room = UtilFunctions.generateUniqueString(name);
        socket.join(room);
        rooms.push({
            roomId: room,
            users: [{
                name: name,
                admin: true
            }]
        });
        io.emit(socket.id, `${room}`);
    });
};

const enterInRoom = ({
    io,
    socket
} = {}) => {
    socket.on('enterInRoom', ({
        data
    }) => {
        socket.join(data.roomId);
        let room = rooms.find((element) => element.roomId = data.roomId);
        room.users.push({
            name: data.name,
            admin: data.name == room.users.find((element) => element.admin == true).name,
        });
        io.emit(data.roomId, { roomId: data.roomId, users: room.users });
    });
};

module.exports = {
    createRoom,
    enterInRoom
};