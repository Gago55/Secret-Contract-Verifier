const { Schema, model } = require('mongoose')

const schema = new Schema({
    zipDataBuffer: {
        type: Schema.Types.Mixed,
        required: true
    },
    codeId: {
        type: Number,
        required: true
    },
    verifyAttemptId: {
        type: String,
        required: true
    },
    builderVersion: {
        type: String,
        required: true,
        enum: [
            '1.0.0',
            '1.0.1',
            '1.0.2',
            '1.0.3',
            '1.0.4'
        ]
    },
    saveToGithub: {
        type: Boolean,
        default: true
    }
})

const VerifyOrderModel = model('verifyOrder', schema)
module.exports = VerifyOrderModel