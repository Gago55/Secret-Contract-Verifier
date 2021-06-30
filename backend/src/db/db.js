const { connect } = require('mongoose')

const connectToDB = () => new Promise(async (res, rej) => {
    try {
        await connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true
        })

        console.log('Connected!')
        res()
    } catch (error) {
        console.log("err" + error)
        rej("err" + error)
    }

})

module.exports = connectToDB