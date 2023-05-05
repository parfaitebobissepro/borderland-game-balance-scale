const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const User = require('../models/user.model');

var usersConnected = {};

const createUser = async(userBody) => {
    return User.create(userBody);
};

const getUserById = (userId) => {
    return User.findById(userId);
}

const updateUserById = async(userId, updateBody) => {
    const user = await getUserById(userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    Object.assign(user, updateBody);
    await user.save();
    return user;
}

async function addUserAsConnected(socketId, userId) {
    await updateUserById(userId, { connected: true });
    usersConnected[socketId] = userId;
}

async function removeUserConnected(socketId) {
    // const index = findUserIndex(userId);
    // usersConnected.splice(index, 1);

    //TODO: Resolv the problem to remove an user as connected; usersConnected[socketId] return [undefined] check it after please; ********* IMPORTANT *******
    // await updateUserById(usersConnected[socketId], { connected: false });
    // delete usersConnected[socketId];
}

// function findUserIndex(socketId) {
//     return usersConnected.findIndex((id) => userId == id);
// }
function isUserWithSocket(socketId) {
    // return usersConnected.findIndex((id) => userId == id);

    return usersConnected.hasOwnProperty(socketId);
}

function getUserWithSocket(socketId) {
    // return usersConnected.findIndex((id) => userId == id);

    return usersConnected[socketId];
}



module.exports = {
    createUser,
    getUserById,
    // findUserIndex,
    removeUserConnected,
    addUserAsConnected,
    isUserWithSocket,
    getUserWithSocket,
    updateUserById
}