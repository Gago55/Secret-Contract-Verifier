const { Schema, model } = require('mongoose')

const codeSchema = new Schema({
    id: {
        type: Number,
        required: true
    },
    isVerified: {
        type: Boolean,
        required: true,
    },
    creator: {
        type: String,
        required: true,
        trim: true
    },
    checksum: {
        type: String,
        required: true,
        trim: true
    },
    source: {
        type: String,
        trim: true
    },
    builder: {
        type: String
    },
})

const CodeModel = model('codes', codeSchema)
module.exports = CodeModel