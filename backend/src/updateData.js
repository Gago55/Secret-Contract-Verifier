const { spawn } = require('child_process')
const dotenv = require('dotenv')
const { CosmWasmClient } = require('secretjs')
const connectToDB = require('./db/db')
const UpdateDataModel = require('./models/UpdateData')

dotenv.config()

const checkForNewCodes = async () => {
    try {
        const client = new CosmWasmClient(process.env.DATAHUB_API_URL)

        const codes = await client.getCodes()
        const lastCodeId = codes.pop().id

        let updateObj = await UpdateDataModel.findOne({})

        if (!updateObj) {
            updateObj = new UpdateDataModel({
                lastCodeId: 0,
                neededCodeIds: []
            })
            await updateObj.save()
        }

        if (updateObj.lastCodeId < lastCodeId) {
            const neededCodeIds = []
            for (let i = updateObj.lastCodeId + 1; i <= lastCodeId; i++) {
                neededCodeIds.push(i)
            }
            updateObj.lastCodeId = lastCodeId
            updateObj.neededCodeIds = neededCodeIds
            await updateObj.save()

        }

        fetchContracts()

    } catch (error) {
        console.log(error)
        process.exit()
    }
}

const fetchContracts = () => {
    const fetch = spawn('node ./src/fetchContracts.js', { shell: true })

    fetch.stdout.on("data", data => {
        console.log(`stdout: ${data}`)
    })

    fetch.stderr.on("data", data => {
        console.log(`stderr: ${data}`)
    })

    fetch.on('error', (error) => {
        console.log(`error: ${error.message}`)
    })

    fetch.on("close", async code => {
        if (code == 0) {
            const updateObj = await UpdateDataModel.findOne({})
            if (updateObj.neededCodeIds.length)
                fetchContracts()
            else
                process.exit()
        }
        else {
            console.log('all done')
            process.exit()
        }
    })
}

connectToDB().then(() => {
    checkForNewCodes()
})