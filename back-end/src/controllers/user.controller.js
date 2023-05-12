const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const {
    userService,
} = require('../services');


const getUser = catchAsync(async(req, res) => {
    const user = await userService.getUserById(req.params.userId);
    res.status(user ? httpStatus.OK : httpStatus.BAD_REQUEST).send(user);
});

module.exports = {
    getUser
}