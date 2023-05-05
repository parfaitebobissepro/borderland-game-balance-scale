const httpStatus = require('http-status');
const UtilFunctions = require('../utils/functions');
const logger = require('../config/logger');
const {
    roomService,
    userService,
    stepService
} = require('../services');
const gameController = require('./game.controller');

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
            await userService.addUserAsConnected(socket.id, user.id);
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
            } else {
                // recover the last step of the room
                let currentStep = room.steps[room.steps.length - 1];

                //add the user to last the step
                currentStep.users.push(user.toJSON());

                //add user as user connected
                await userService.addUserAsConnected(socket.id, user.id);

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


const makeStepGameOfRoom = ({
    io,
    socket
} = {}) => {
    socket.on('makeStepGameOfRoom', async(
        data
    ) => {
        //On attend maximum 02 seconde la réponse des utilisateurs
        setTimeout(async() => {
            //get datas

            // let userId = data.userId;
            let roomId = data.roomId;
            let response = data.response;
            // let stepId = data.stepId;

            //get models
            // let user = await userService.getUserByI(userId);
            let room = await roomService.getRoomByIdRoomId(roomId);
            let lastStep = room.steps[room.steps.length - 1];
            lastStep = lastStep.toJSON();

            //room

            //check if room not closed
            if (!room.closed) {

                /**************    STRAT PROCESS TO SEE AFTER     ****************** */

                //check if step always exist
                // if (!lastStep.closed) {
                //     //if step always exist : add user response
                //     let currentUserIndex = lastStep.users.findIndex((user) => user.id == userId);
                //     if (currentUserIndex != -1) {
                //         lastStep.users[currentUserIndex].currentResponse = response;

                //         //Update the currentUser
                //         await userService.updateUserById(lastStep.users[currentUserIndex].id, lastStep.users[currentUserIndex]);

                //         //update users for step game, data are directly updated in BD
                //         await gameController.makeGameStepRules(lastStep.id);


                //         //send back informations of game
                //         let roomUpdated = await roomService.getRoomByIdRoomId(room.roomId);
                //         roomUpdated = roomUpdated.toJSON();
                //         io.emit(`game-${room.roomId}`, roomUpdated);

                //         //clear current data of users
                //         lastStep.users.forEach(user => {
                //             gameController.clearDataUser(user);
                //         });

                //         //close the step
                //         gameController.closeStep(lastStep);
                //     }
                // } else {

                /**************    END PROCESS TO SEE AFTER     ****************** */


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

                io.emit(`game-${room.roomId}`, roomUpdated);


                //clear current data of users 
                newStep = newStep.toJSON();
                newStep.users.forEach(async(userId) => {
                    userId = userId.toJSON();
                    await gameController.clearDataUser(userId);
                });

                //close the step
                gameController.closeStep(newStep);

                // }
            }
        }, 2000);
    });
};


const disconnection = ({
    io,
    socket
} = {}) => {
    socket.on('disconnect', async() => {
        let userId = userService.getUserWithSocket(socket.id);
        if (userId) {
            logger.info('user disconnected ', userId);
            await userService.removeUserConnected(userId);
        }


    });
};





module.exports = {
    createRoom,
    joinRoom,
    respondToStepOfRoom,
    disconnection,
    makeStepGameOfRoom,
    lauchGame
};