const UtilFunctions = require('../utils/functions');
const logger = require('../config/logger');
const {
    roomService,
    userService,
    stepService
} = require('../services');
const gameController = require('./game.controller');

const TIMEOUT_AWAITING_USERS_RESPONES = 2000;

const getParamsOfServer = ({
    socket,
    io
} = {}) => {
    socket.on('getParamsOfServer', async(msg) => {
        io.emit('serverParams', {
            timeInterAwaitResponseServer: TIMEOUT_AWAITING_USERS_RESPONES,
            sel: gameController.SEL,
            globalScoreMax: gameController.GLOBALSCORE_MAX
        });
    });
};
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
                steps: [step],
                actualServerDate: new Date(Date.now())
            });

            io.emit(socket.id, room.toJSON());

            //add user as user connected
            await userService.addUserAsConnected(socket.id, user.id, room.id);
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

        //create Json Copy of room to send to front 
        let room = await roomService.getRoomByIdRoomId(data.roomId);
        room = room.toJSON();

        const indexOfPseudo = room.steps[room.steps.length - 1].users.findIndex((user) => user.pseudo == data.pseudo);

        if (indexOfPseudo == -1) {
            //Pseudo not exist already, user can join channel

            //add new user to current room and back the current user
            const user = await userService.createUser({
                pseudo: data.pseudo,
                admin: false
            });

            //create Json Copy of user to send to front 
            const userJson = Object.assign({}, user.toJSON());

            if (room.steps.length > 1) {
                /// The game always started, the current user can't join the channel

                //add user as user connected
            } else {
                // recover the last step of the room
                let currentStep = room.steps[room.steps.length - 1];

                //add the user to last the step
                currentStep.users.push(user.toJSON());

                //add user as user connected
                await userService.addUserAsConnected(socket.id, user.id, room.id);

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

                //send back new user his informations
                io.emit(`game-${room.roomId}`, room);

                //update date of room
                room.actualServerDate = new Date(Date.now());

                //send event with updated room
                io.emit(`${room.roomId}-${userJson.pseudo}`, {
                    type: 'user',
                    content: userJson
                });
            }
        }
    });
};


const respondToStepOfRoom = ({
    io,
    socket
} = {}) => {
    socket.on('respondToStep', async(
        data
    ) => {
        const userUpdated = {
            currentWinner: false,
            currentResponse: parseInt(data.response),
        };
        await userService.updateUserById(data.userId, userUpdated);
    });
};


const lauchGame = ({
    io,
    socket
} = {}) => {
    socket.on('lauchGame', async(
        roomId
    ) => {
        io.emit(`startGame-${roomId}`, true);
    })
};

const addNewConnectedGame = ({
    io,
    socket
} = {}) => {
    socket.on('addNewConnectedGame', async(
        data
    ) => {
        await userService.addUserAsConnected(socket.id, data.userId, data.roomId);
    })
};


const makeStepGameOfRoom = ({
    io,
    socket
} = {}) => {
    socket.on('makeStepGameOfRoom', async(
        data
    ) => {
        //On attend maximum 02 seconde la réponse des utilisateurs
        setTimeout(async() => {

            //get room datas
            let roomId = data.roomId;

            //get room model and last step
            let room = await roomService.getRoomByIdRoomId(roomId);
            let lastStep = room.steps[room.steps.length - 1];
            lastStep = lastStep.toJSON();

            //check if room not closed
            if (!room.closed) {
                //else create new step and add user response
                let users = await Promise.all(lastStep.users.map(async(user) => {
                    const userUpdated = {
                        ...user,
                        currentWinner: false,
                    };
                    await userService.updateUserById(userUpdated.id, userUpdated);
                    return userUpdated.id;
                }));
                let newStep = await stepService.createStep({
                    rang: parseInt(lastStep.rang) + 1,
                    startDate: Date.now(),
                    users: users
                });

                //update users for step game, data are directly updated in BD
                await gameController.makeGameStepRules(newStep.id);


                //update current room
                room.steps.push(newStep);
                await roomService.updateRoomById(room.id, room);

                //send back informations of game
                let roomUpdated = await roomService.getRoomByIdRoomId(room.roomId);
                roomUpdated = roomUpdated.toJSON();


                //update date of room
                roomUpdated.actualServerDate = new Date(Date.now());

                //send back datas of room
                io.emit(`game-${room.roomId}`, roomUpdated);


                //clear current data of users 
                newStep = newStep.toJSON();
                newStep.users.forEach(async(userId) => {
                    userId = userId.toJSON();
                    await gameController.clearDataUser(userId);
                });

                //close the step
                gameController.closeStep(newStep);
            }
        }, TIMEOUT_AWAITING_USERS_RESPONES);
    });
};


const disconnection = ({
    io,
    socket
} = {}) => {
    socket.on('disconnect', async() => {
        const userId = userService.getUserWithSocket(socket.id);

        if (userId) {

            //remover user as admin
            const user = await userService.getUserById(userId);

            if (user.admin == true) {

                //if admin, remove for him admin access
                let SocketIdObject = findEntrieInConnectedSocketUsers(userService.usersConnected, userId);
                if (SocketIdObject) {
                    await userService.removeUserAsAdmin(SocketIdObject.key);
                }

                //find new admin
                SocketIdObject = findAnyInConnectedSocketUsers(userService.usersConnected);
                let userIdFound, roomIdFound;
                if (SocketIdObject) {
                    userIdFound = SocketIdObject.value.split(' ')[0];
                    roomIdFound = SocketIdObject.value.split(' ')[1];
                }

                //assign access to new admin
                if (userIdFound) {
                    await userService.updateUserById(userIdFound, {
                        admin: true
                    });
                }

                //send back informations of game
                if (roomIdFound) {
                    let roomUpdated = await roomService.getRoomById(roomIdFound);
                    roomUpdated = roomUpdated.toJSON();
                    io.emit(`game-${roomUpdated.roomId}`, roomUpdated);
                }

                logger.info('user disconnected ');
            }

        }
    });
};


const findEntrieInConnectedSocketUsers = (object, valueToFind) => {
    for (const [key, value] of Object.entries(object)) {
        if (value.split(' ')[0] == valueToFind) {
            return {
                key: key,
                value: value
            };
        }
    }
}
const findAnyInConnectedSocketUsers = (object) => {
    for (const [key, value] of Object.entries(object)) {
        if (value.split(' ')[0]) {
            return {
                key: key,
                value: value
            };
        }
    }
}






module.exports = {
    createRoom,
    joinRoom,
    respondToStepOfRoom,
    disconnection,
    makeStepGameOfRoom,
    lauchGame,
    addNewConnectedGame,
    getParamsOfServer
};