const { Schema, model } = require('mongoose')

const contractSchema = new Schema({
    address: {
        type: String,
        required: true,
        trim: true
    },
    codeId: {
        type: Number,
        required: true
    },
    label: {
        type: String,
        required: true,
        trim: true
    },
    creator: {
        type: String,
        required: true,
        trim: true
    }
})


const ContractModel = model('contracts', contractSchema)
module.exports = ContractModel