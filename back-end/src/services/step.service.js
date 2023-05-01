const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const Step = require('../models/step.model');

const createStep = async(stepBody) => {
    return Step.create(stepBody);
};


const getStepById = (stepId) => {
    return Step.findById(stepId).populate({
        path: 'users'
    });
}

const updateStepById = async(stepId, updateBody) => {
    const step = await getStepById(stepId);
    if (!step) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Step not found');
    }
    Object.assign(step, updateBody);
    await step.save();
    return step;
}

module.exports = {
    createStep,
    getStepById,
    updateStepById
}