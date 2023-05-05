const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const {
    roomService,
    stepService,
    userService
} = require('../services');

const SEL = 0.8;


const userConnected = (user) => user.currentResponse != null;
const getStepWinner = async(stepId) => {
    //get step from BD
    let step = await stepService.getStepById(stepId);
    step = step.toJSON();

    //get array of responses
    let responsesArray = [];
    step.users.forEach((user) => responsesArray.push(user.currentResponse));

    //get average rounded
    let average = Math.round(getAverage(responsesArray));

    //get user most near to average
    let min = 100;
    let userStepwinner = 100;
    let isExactlyTargetNumber = false;

    //TODO: check number of participats before assign winner with right rule
    //TODO: if 2 participants
    //TODO: if 3 participants

    //TODO: more than 3 participants
    step.users.forEach((user) => {
        const diff = Math.abs(user.currentResponse - (average * SEL));
        if (diff == 0) {
            min = diff;
            isExactlyTargetNumber = true;
            userStepwinner = user;
        } else if (diff < min) {
            min = diff;
            userStepwinner = user;
        }
    });


    step.users.map(async(user) => {
        if (user.id != userStepwinner.id) {
            user.globalScore--;
            await userService.updateUserById(user.id, user);
        } else {
            user.currentWinner = true;
            await userService.updateUserById(user.id, user);
        }
    });






    return {
        userStepwinner: userStepwinner,
        isExactlyTargetNumber: isExactlyTargetNumber,
    }

};

const getAverage = (arrayResponses) => {
    // Using reduce() to sum up the array elements
    const sum = arrayResponses.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // Calculating the average by dividing the sum by the number of elements
    return sum / arrayResponses.length;
}

const clearDataUser = async(userId) => {
    await userService.updateUserById(userId, { currentResponse: null, currentWinner: false });
};
const closeStep = async(step) => {
    step.closed = true;
    await stepService.updateStepById(step.id, step);
};


const getRandomInt = (max) => Math.floor(Math.random() * max);

const makeGameStepRules = async(stepId) => {
    let step = await stepService.getStepById(stepId);
    step = step.toJSON();

    //if step not close
    if (!step.closed) {
        //get All users connected
        if (step.users.every(userConnected)) {
            //TODO:if all users connected have given response their responses
            // make game & respond
            await getStepWinner(stepId);
            // //clear current data of users
            // step.users.forEach(user => {
            //     clearDataUser(user);
            // });

            // //close the step
            // closeStep(stepId);

        } else {
            //TODO:else if some of all users connected or not dont give response
            //if start Step pass timer + 1 second
            // if (new Date(Date.now() + 1000) >= step.startDate) {
            //Assign Radom response

            //get users without response in BD
            let newStepFromBD = await stepService.getStepById(stepId);
            newStepFromBD = newStepFromBD.toJSON();

            //get users withoutResponses
            let usersWithoutResponse = newStepFromBD.users.filter(user => !user.currentResponse);
            usersWithoutResponse.forEach(async(user) => {
                user.currentResponse = getRandomInt(100);
                //save user
                await userService.updateUserById(user.id, user);
            });

            // make game & respond
            await getStepWinner(stepId);

            // //clear current data of users
            // step.users.forEach(user => {
            //     clearDataUser(user);
            // });

            // //close the step
            // closeStep(stepId);
            // }

        }


    }




    //Assign random responses for all non connected




    //emit even with response

};

module.exports = {
    makeGameStepRules,
    clearDataUser,
    closeStep
}