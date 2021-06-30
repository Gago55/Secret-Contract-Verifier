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
        type: String,
        enum: [
            'enigmampc/secret-contract-optimizer:1.0.0',
            'enigmampc/secret-contract-optimizer:1.0.1',
            'enigmampc/secret-contract-optimizer:1.0.2',
            'enigmampc/secret-contract-optimizer:1.0.3',
            'enigmampc/secret-contract-optimizer:1.0.4'
        ]
    },
})

const CodeModel = model('codes', codeSchema)
module.exports = CodeModel