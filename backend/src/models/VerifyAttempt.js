const { Schema, model } = require('mongoose')

const schema = new Schema({
    codeId: {
        type: Number,
        required: true
    },
    logs: [String],
    status: {
        type: String,
        enum: [
            'onProgress',
            'failed',
            'success',
            'inOrder'
        ],
        default: 'onProgress'
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const VerifyAttemptModel = model('verifyAttempt', schema)
module.exports = VerifyAttemptModel