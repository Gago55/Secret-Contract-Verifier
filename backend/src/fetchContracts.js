const dotenv = require('dotenv')
const { CosmWasmClient } = require('secretjs')
const connectToDB = require('./db/db')
const UpdateDataModel = require('./models/UpdateData')
const CodeModel = require('./models/Code')
const ContractModel = require('./models/Contract')

dotenv.config()

const fetchData = async () => {
    const updateObj = await UpdateDataModel.findOne({})

    let neededCodeIds = [...updateObj.neededCodeIds]

    if (neededCodeIds.length) {
        const codeId = updateObj.neededCodeIds[0]

        const codeInDB = await CodeModel.findOne({ id: codeId })

        if (!codeInDB) {
            const client = new CosmWasmClient(process.env.DATAHUB_API_URL)

            const code = await client.getCodeDetails(codeId)

            const newCode = new CodeModel({
                id: code.id,
                isVerified: false,
                creator: code.creator,
                checksum: code.checksum,
                source: code.source,
                builder: code.builder
            })

            await newCode.save()

            const newContracts = await client.getContracts(codeId)

            for (const contract of newContracts) {
                const contractInDB = await ContractModel.findOne({ address: contract.address })

                if (!contractInDB) {
                    const newContract = new ContractModel({
                        address: contract.address,
                        codeId: contract.codeId,
                        label: contract.label,
                        creator: contract.creator
                    })

                    await newContract.save()
                }
            }

        }

        neededCodeIds.shift()
        updateObj.neededCodeIds = neededCodeIds
        await updateObj.save()

        console.log('Done code id ' + codeId)

    }

    process.exit()
}

connectToDB().then(() => {
    try {
        fetchData()
    } catch (error) {
        console.log(error)
        process.exit()
    }
})