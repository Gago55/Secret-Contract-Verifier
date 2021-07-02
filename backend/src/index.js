const dotenv = require('dotenv')
dotenv.config()

const express = require('express')
const CodeModel = require('./models/Code')
const connectToDB = require('./db/db.js')
const ContractModel = require('./models/Contract')
const VerifyAttemptModel = require('./models/VerifyAttempt')
const VerifyOrderModel = require('./models/VerifyOrder')
const multer = require('multer')
const upload = multer()
const { verify, endVerification, checkOrder } = require('./verification')
const VerifiedSourceModel = require('./models/VerifiedSource')
const { CosmWasmClient } = require('secretjs')

const app = express();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Methods", "POST, PUT, GET, OPTIONS")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept ")
    next()
})

app.use(express.json())

const checkVerifyAttemptsStatus = async () => {
    const attempts = await VerifyAttemptModel.find({ status: 'onProgress' })

    for (const attempt of attempts) {
        attempt.logs.push('Something went wrong, try again')
        await attempt.save()

        endVerification(attempt.codeId, attempt)
    }

    checkOrder()
}

connectToDB().then(() => {
    app.listen(process.env.PORT)
    console.log('working on ' + process.env.PORT)

    checkVerifyAttemptsStatus()
})

app.get('/contracts', async (req, res) => {
    // Get Codes
    try {
        const results = await ContractModel.find({})

        res.send(results)
    } catch (error) {
        res.status(401).send()
    }
})

app.get('/contracts/:address', async (req, res) => {
    // Get Contract by address
    try {
        const results = await ContractModel.findOne({ address: req.params.address })

        res.send(results)
    } catch (error) {
        res.status(401).send()
    }
})

app.get('/contracts/codeID/:id', async (req, res) => {
    // Get Contracts by codeID
    try {
        const results = await ContractModel.find({ codeId: req.params.id })

        res.send(results)
    } catch (error) {
        res.status(401).send()
    }
})

app.get('/codes', async (req, res) => {
    // Get Codes
    try {
        const results = await CodeModel.find({})

        res.send(results)
    } catch (error) {
        res.status(401).send()
    }
})

app.get('/codeswithcontracts', async (req, res) => {
    // Get Codes with their Contracts
    try {
        const codes = await CodeModel.find({})

        const results = []

        for (const code of codes) {

            const contracts = await ContractModel.find({ codeId: code.id })

            results.push({
                id: code.id,
                isVerified: code.isVerified,
                creator: code.creator,
                checksum: code.checksum,
                builder: code.builder,
                source: code.source,
                contracts
            })
        }

        res.send(results)
    } catch (error) {
        res.status(401).send()
    }
})

app.get('/codes/:codeID', async (req, res) => {
    // Get Code by codeID
    try {
        const results = await CodeModel.findOne({ id: req.params.codeID })

        res.send(results)
    } catch (error) {
        res.status(401).send()
    }
})

const cpUpload = upload.any()
app.post('/codes/verify/:codeID', cpUpload, async (req, res) => {
    /* 
        Verify Code, expected in body formData, which contain 
            'builderVersion' which is can be '1.0.0' | '1.0.1' | '1.0.2' | '1.0.3' | '1.0.4' 
            'zipData' which is blob of zip file, which contaions contract's source code
    */
    try {
        const code = await CodeModel.findOne({ id: req.params.codeID })

        if (!code)
            throw new Error(`There isn't code with id ${req.params.codeID}`)

        if (code.isVerified)
            throw new Error(`Code with id ${code.id} is already verified`)

        const onGoingAttemptWithSameCodeId = await VerifyAttemptModel.findOne({ $or: [{ codeId: code.id, status: 'onProgress' }, { codeId: code.id, status: 'inOrder' }] })

        if (onGoingAttemptWithSameCodeId) {
            res.status(202).send({ onProgressAttemptId: onGoingAttemptWithSameCodeId.id })
            return
        }

        const builderVersion = req.body.builderVersion
        const zipData = req.files[0]

        const onProgressAttempt = await VerifyAttemptModel.findOne({ status: 'onProgress' })

        if (onProgressAttempt) {
            const verifyAttempt = new VerifyAttemptModel({ codeId: code.id, status: 'inOrder' })
            await verifyAttempt.save()

            const verifyOrder = new VerifyOrderModel({
                zipDataBuffer: { any: zipData.buffer },
                codeId: code.id,
                verifyAttemptId: verifyAttempt.id,
                builderVersion
            })

            await verifyOrder.save()

            res.status(201).json({
                message: 'Your VerifyAttempt is in order',
                verifyAttemptId: verifyAttempt.id,
                onProgressAttemptId: onProgressAttempt.id
            })
        }
        else {
            const verifyAttempt = new VerifyAttemptModel({ codeId: code.id })
            await verifyAttempt.save()

            verify(zipData.buffer, builderVersion, code, verifyAttempt, JSON.parse(process.env.SAVE_TO_GITHUB))

            res.json({ verifyAttemptId: verifyAttempt.id })
        }
    } catch (error) {
        res.status(401).send({ message: error.message })
    }
})

app.get('/codeswithcontracts/contractAddress/:address', async (req, res) => {
    // Get Code with it's contarcts by one of it's contract address
    try {
        const contract = await ContractModel.findOne({ address: req.params.address })

        if (contract) {
            const code = await CodeModel.findOne({ id: contract.codeId })

            const contracts = await ContractModel.find({ codeId: code.id })

            res.send({
                id: code.id,
                isVerified: code.isVerified,
                creator: code.creator,
                checksum: code.checksum,
                builder: code.builder,
                source: code.source,
                contracts
            })
        }
        else {
            const client = new CosmWasmClient(process.env.DATAHUB_API_URL)

            const contract = await client.getContract(req.params.address)

            if (contract) {
                const code = await CodeModel.findOne({ id: contract.codeId })

                if (code) { //In this case contract was initialized after app fetch data about this code
                    const newContract = new ContractModel({
                        address: contract.address,
                        codeId: contract.codeId,
                        label: contract.label,
                        creator: contract.creator
                    })

                    await newContract.save()

                    const contracts = await ContractModel.find({ codeId: code.id })

                    res.send({
                        id: code.id,
                        isVerified: code.isVerified,
                        creator: code.creator,
                        checksum: code.checksum,
                        builder: code.builder,
                        source: code.source,
                        contracts
                    })
                }
                else {//In this case app haven't fetch data about this code yet
                    res.status(402).send({ message: 'Please wait an hour, and try again' })
                }
            }

            res.status(402).send({ message: 'There is not contract in blockchain with address ' + req.params.address })
        }

    } catch (error) {
        res.status(401).send({ message: error.message })
    }
})

app.get('/verifyattempts', async (req, res) => {
    // Get Verify Attempts 
    try {
        const results = await VerifyAttemptModel.find({})

        res.send(results)
    } catch (error) {
        res.status(401).send()
    }
})

app.get('/verifyattempts/:id', async (req, res) => {
    // Get Verify Attempt by Id 
    try {
        const result = await VerifyAttemptModel.findById(req.params.id)

        res.send(result)
    } catch (error) {
        res.status(401).send({ message: error.message })
    }
})

app.get('/verifyattempts/codeId/:id', async (req, res) => {
    // Get Verify Attempts by CodeId 
    try {
        const results = await VerifyAttemptModel.find({ codeId: req.params.id })

        res.send(results)
    } catch (error) {
        res.status(401).send({ message: error.message })
    }
})

app.get('/verifiedsource/:codeId', async (req, res) => {
    // Get Verified Source by CodeId 
    try {
        const result = await VerifiedSourceModel.findOne({ codeId: req.params.codeId })

        res.send(result)
    } catch (error) {
        res.status(401).send({ message: error.message })
    }
})

