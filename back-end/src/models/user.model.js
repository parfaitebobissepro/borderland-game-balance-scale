const mongoose = require('mongoose');
const { Schema } = mongoose;
const {
    toJSON
} = require('./plugins');

const userSchema = Schema({
    pseudo: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: String,
        required: false,
    },
    currentResponse: {
        type: Number,
        required: false,
        validate(value) {
            if (value >= 100 && value <= 0) {
                throw new Error('Invalid response');
            }
        },
    },
    currentWinner: {
        type: Boolean,
        required: false,
    },
    globalScore: {
        type: Number,
        required: false,
        default: 10
    },
    globalWinner: {
        type: Boolean,
        required: false,
    },
    admin: {
        type: Boolean,
        required: false,
    },
    eliminate: {
        type: Boolean,
        required: false,
    },
    connected: {
        type: Boolean,
        required: false,
    }
}, {
    timestamps: true,
});

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);

const User = mongoose.model('User', userSchema);

module.exports = User;