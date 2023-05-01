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
            if (value >= 0 && value <= 100) {
                throw new Error('Invalid response');
            }
        },
    },
    globalScore: {
        type: Number,
        required: false,
    },
    admin: {
        type: Boolean,
        required: false,
    },
    winner: {
        type: Boolean,
        required: false,
    },
}, {
    timestamps: true,
});

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);

const User = mongoose.model('User', userSchema);

module.exports = User;