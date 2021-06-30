const { Schema, model } = require('mongoose')

const schema = new Schema({
    lastCodeId: {
        type: Number
    },
    neededCodeIds: {
        type: [Number]
    }
})

const UpdateDataModel = model('updateData', schema)
module.exports = UpdateDataModel