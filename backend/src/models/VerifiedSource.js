const { Schema, model } = require('mongoose')

const schema = new Schema({
    codeId: {
        type: Number,
        required: true
    },
    zipData: {
        type: String,
        required: true
    },
    githubLink: String,
    date: {
        type: Date,
        default: Date.now
    }
})

const VerifiedSourceModel = model('verifiedSource', schema)
module.exports = VerifiedSourceModel