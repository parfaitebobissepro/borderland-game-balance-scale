const mongoose = require('mongoose');
const { Schema } = mongoose;
const {
    toJSON
} = require('./plugins');


const stepSchema = Schema({
    rang: {
        type: Number,
        required: true,
        trim: true,
    },
    startDate: {
        type: Date,
        required: true,
        trim: true,
    },
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, {
    timestamps: true,
});

// add plugin that converts mongoose to json
stepSchema.plugin(toJSON);

const Step = mongoose.model('Step', stepSchema);

module.exports = Step;