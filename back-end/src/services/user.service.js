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

async function addUserAsConnected(socketId, userId, roomId) {
    await updateUserById(userId, { connected: true });
    usersConnected[socketId] = userId + ' ' + roomId;
}

async function removeUserAsConnected(socketId) {
    let userIdFound = usersConnected[socketId].split(' ')[0];
    await updateUserById(userIdFound, { connected: false });
    delete usersConnected[socketId];
}
async function removeUserAsAdmin(socketId) {
    let userIdFound = usersConnected[socketId].split(' ')[0];
    await updateUserById(userIdFound, { admin: false });
    delete usersConnected[socketId];
}

// function findUserIndex(socketId) {
//     return usersConnected.findIndex((id) => userId == id);
// }
function isUserWithSocket(socketId) {
    // return usersConnected.findIndex((id) => userId == id);

    return usersConnected.hasOwnProperty(socketId);
}

function getUserWithSocket(socketId) {
    let userId = usersConnected[socketId];
    if (userId && userId.split(' ').length > 0) {
        return userId.split(' ')[0];
    }
}



module.exports = {
    createUser,
    getUserById,
    // findUserIndex,
    removeUserAsConnected,
    addUserAsConnected,
    isUserWithSocket,
    getUserWithSocket,
    updateUserById,
    removeUserAsAdmin,
    usersConnected
}