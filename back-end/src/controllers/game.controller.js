const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const {
    roomService,
    stepService,
    userService
} = require('../services');

const SEL = 0.8;
const GLOBALSCORE_MAX = 10;


const userConnected = (user) => user.currentResponse != null;
const getStepWinner = async(stepId) => {
    //get step from BD
    let step = await stepService.getStepById(stepId);
    step = step.toJSON();

    //remove some users than can't be count for the step
    step.users = step.users.filter((user) => user.globalScore > 0);



    //get user most near to average
    const MAX = 100;
    let min = MAX;
    let userStepwinner = MAX;
    let isExactlyTargetNumber = false;

    var usersWithSameResponses = [];



    //TODO: check number of participats before assign winner with right rule
    if (step.users.length <= 2) {
        //TODO: if we have 2 participants
        let userWithResponseZero = step.users.find((user) => user.currentResponse == 0);

        if (userWithResponseZero) {
            let otherUser = step.users.find((user) => user.currentResponse == MAX);
            if (otherUser) {
                //user with 0 response is loser 
                userWithResponseZero.globalScore--;
                await userService.updateUserById(userWithResponseZero.id, userWithResponseZero);

                //other user is winner
                otherUser.currentWinner = true;
                await userService.updateUserById(otherUser.id, otherUser);

                //return game result
                return {
                    userStepwinner: otherUser
                }
            }
        }

    }

    if (step.users.length <= 4) {
        //TODO: if we have 3 participants

        //decrement globalScore of users
        for (let user of step.users) {
            let userWithSameResponse = step.users.find((element) => element.currentResponse == user.currentResponse && element.id != user.id);
            if (userWithSameResponse) {
                user.sameCurrentResponse = true;
                user.globalScore--;
                await userService.updateUserById(user.id, user);
                usersWithSameResponses.push(user);
            }
        }

        //remove users with same Responses
        usersWithSameResponses = usersWithSameResponses.map((userWithSameResponses) => userWithSameResponses = userWithSameResponses.id);
        step.users = step.users.filter((user) => !usersWithSameResponses.includes(user.id));
    }


    if (step.users.length > 0) {
        //get array of responses
        let responsesArray = [];
        step.users.forEach((user) => responsesArray.push(user.currentResponse));

        //get average rounded
        let average = getAverage(responsesArray);

        if (step.users)
            step.users.forEach((user) => {
                const diff = Math.abs(user.currentResponse - Math.round((average * SEL)));
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
                user.globalScore = isExactlyTargetNumber && step.users.length <= 3 ? user.globalScore - 2 : user.globalScore - 1;
                await userService.updateUserById(user.id, user);
            } else {
                user.currentWinner = true;
                user.exactlyNumberFound = isExactlyTargetNumber;
                await userService.updateUserById(user.id, user);
            }
        });

        return {
            userStepwinner: userStepwinner,
            isExactlyTargetNumber: isExactlyTargetNumber,
        }
    } else {
        return {
            userStepwinner: null,
            isExactlyTargetNumber: null,
        }
    }



};

const getAverage = (arrayResponses) => {
    // Using reduce() to sum up the array elements
    const sum = arrayResponses.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // Calculating the average by dividing the sum by the number of elements
    return sum / arrayResponses.length;
}

const clearDataUser = async(userId) => {
    await userService.updateUserById(userId, {
        currentResponse: null,
        currentWinner: false,
        exactlyNumberFound: false,
    });
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

        } else {
            //TODO:else if some of all users connected or not dont give response

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
        }


    }
};

module.exports = {
    makeGameStepRules,
    clearDataUser,
    closeStep,
    SEL,
    GLOBALSCORE_MAX
}