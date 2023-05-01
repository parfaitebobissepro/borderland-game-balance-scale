const ApiError = require('../utils/ApiError');
const User = require('../models/user.model');

const createUser = async(userBody) => {
    return User.create(userBody);
};

module.exports = {
    createUser
}