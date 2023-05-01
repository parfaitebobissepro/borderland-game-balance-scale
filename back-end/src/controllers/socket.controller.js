const httpStatus = require('http-status');
const UtilFunctions = require('../utils/functions');
const {
    roomService,
    userService,
    stepService
} = require('../services');


const createRoom = ({
    socket,
    io
} = {}) => {
    socket.on('createRoom', async(pseudo) => {
        if (pseudo != null && pseudo != '') {
            const roomId = UtilFunctions.generateUniqueString(pseudo);
            //join the room
            socket.join(roomId);
            const user = await userService.createUser({
                pseudo: pseudo,
                admin: true
            });
            const step = await stepService.createStep({
                rang: 0,
                startDate: Date.now(),
                users: [user]
            });
            const room = await roomService.createRoom({
                roomId: roomId,
                steps: [step]
            });
            io.emit(socket.id, room.toJSON());
        }
    });
};

const joinRoom = ({
    io,
    socket
} = {}) => {
    socket.on('joinRoom', async(
        data
    ) => {
        socket.join(data.roomId);

        //add new user to current room and back the current user
        const user = await userService.createUser({
            pseudo: data.pseudo,
            admin: false
        });

        let room = await roomService.getRoomByIdRoomId(data.roomId);
        room = room.toJSON();

        if (room.steps.length > 1) {
            /// The game always started, the current user can't join the channel
        } else {
            // recover the last step of the room
            let currentStep = room.steps[room.steps.length - 1];

            //add the user to last the step
            currentStep.users.push(user.toJSON());

            // clone current step object to avoid modifiying the original
            const updatedStep = {
                ...currentStep
            };

            //add updated step to room
            room.steps[room.steps.length - 1] = updatedStep;

            //remove informations other than ids for each users
            currentStep.users = currentStep.users.map(user => {
                return user.id;
            });

            //update step in database
            await stepService.updateStepById(currentStep.id, currentStep);

            //send event with updated room
            io.emit(`game-${room.roomId}`, room);
        }
    });
};

module.exports = {
    createRoom,
    joinRoom
};