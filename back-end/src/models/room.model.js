const mongoose = require('mongoose');
const {
    Schema
} = mongoose;

const {
    toJSON
} = require('./plugins');

const roomSchema = Schema({
    roomId: {
        type: String,
        required: true,
    },
    steps: [{
        type: Schema.Types.ObjectId,
        ref: 'Step'
    }],
    closed: {
        type: Boolean,
        default: false
    },
    actualServerDate: {
        type: Date,
        default: new Date(Date.now())
    }
}, {
    timestamps: true,
});

// add plugin that converts mongoose to json
roomSchema.plugin(toJSON);

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;