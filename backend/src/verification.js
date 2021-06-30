const fs = require('fs')
const { spawn } = require('child_process')
const CodeModel = require('./models/Code')
const VerifiedSourceModel = require('./models/VerifiedSource')
const VerifyOrderModel = require('./models/VerifyOrder')
const VerifyAttemptModel = require('./models/VerifyAttempt')

const verify = (zipDataBuffer, builderVersion, codeObject, verifyAttempt, saveToGithub = false) => {
    const codeId = codeObject.id
    const hash = codeObject.checksum

    const newFolder = spawn(
        `mkdir verifyingId${codeId} && 
        cd verifyingId${codeId}`
        , { shell: true }
    )

    newFolder.on("close", async code => {
        if (code != 0) {
            verifyAttempt.status = 'failed'
            await verifyAttempt.save()
            throw 'Cant create temp folder'
        }


        fs.writeFile(`verifyingId${codeId}/contract.zip`, Buffer.from(zipDataBuffer), {}, () => {
            const zipCommands = spawn(
                `cd verifyingId${codeId} && 
                    unzip contract.zip && rm contract.zip`
                , { shell: true }
            )

            zipCommands.on("close", code => {
                if (code != 0) {
                    endVerification(codeId, verifyAttempt)
                    throw 'Something went wrong while unpacking'
                }

                const deleteFolder = spawn(
                    `cd verifyingId${codeId} && 
                        ITEMSCOUNT=$(ls | wc -l) &&
                        if [ $ITEMSCOUNT -eq 1 ] ; 
                            then FOLDERNAME=$(ls) && 
                            mv -v ./$FOLDERNAME/* ./ && 
                            rm -rf $FOLDERNAME ; 
                        fi`,
                    { shell: true }
                )

                deleteFolder.on("close", async code => {
                    if (code != 0) {
                        endVerification(codeId, verifyAttempt)
                        throw 'Something went wrong'
                    }

                    verifyAttempt.logs = [`docker run --rm -v $(pwd)/verifyingId${codeId}:/contract -e HASH=${hash} gago55/secret-contract-verifier:${builderVersion}\n`]
                    await verifyAttempt.save()

                    const runDocker = spawn(
                        `sudo docker run --rm -v $(pwd)/verifyingId${codeId}:/contract -e HASH=${hash} gago55/secret-contract-verifier:${builderVersion}`
                        , { shell: true }
                    )

                    let logs = []
                    addLogsToDB(logs, verifyAttempt)

                    runDocker.stdout.on('data', async (data) => {
                        if (data.toString().length > 1) {
                            logs.push(data.toString())
                            // console.log(`stdout: ${data}`)
                        }
                    })

                    runDocker.stderr.on('data', async (data) => {
                        if (data.toString().length > 1) {
                            logs.push(data.toString())
                            // console.log(`stderr: ${data}`)
                        }
                    })

                    runDocker.on("close", code => {
                        if (code != 0) {
                            endVerification(codeId, verifyAttempt)
                            throw 'Something went wrong in docker'
                        }

                        const checkResult = spawn(
                            `cat verifyingId${codeId}/output.txt`
                            , { shell: true }
                        )

                        checkResult.stdout.on('data', async (data) => {

                            if (data.toString().split('\n')[0] === 'TRUE') {

                                codeObject.isVerified = true
                                codeObject.builder = 'enigmampc/secret-contract-optimizer:' + builderVersion
                                await codeObject.save()

                                saveSource(codeId, saveToGithub, verifyAttempt)
                            }
                            else {
                                endVerification(codeId, verifyAttempt)
                            }

                        })
                    })
                })
            })
        })

    })
}

const addLogsToDB = (logs, verifyAttempt) => {
    setTimeout(async () => {

        if (logs.length) {
            console.log(logs)
            verifyAttempt.logs.push(...logs)
            logs.length = 0
            await verifyAttempt.save()
        }
        else {
            console.log("Empty logs")
        }

        if (verifyAttempt.status == 'onProgress')
            addLogsToDB(logs, verifyAttempt)
    }, 5000)
}

const saveSource = (codeId, saveGithub, verifyAttempt) => {
    const zipSource = spawn(
        `cd verifyingId${codeId} && rm contract.wasm && rm output.txt &&
        zip -r code${codeId}.zip ./*`
        , { shell: true }
    )

    zipSource.on('close', code => {
        if (code != 0) {
            endVerification(codeId, verifyAttempt)
            throw "Can't zip"
        }

        fs.readFile(`./verifyingId${codeId}/code${codeId}.zip`, { encoding: 'base64' }, async (err, data) => {
            if (err) {
                endVerification(codeId, verifyAttempt)
                throw err
            }

            const verifiedSource = new VerifiedSourceModel({
                codeId,
                zipData: data
            })

            await verifiedSource.save()

            if (saveGithub)
                saveSourceGithub(codeId, verifiedSource, verifyAttempt)
            else
                endVerification(codeId, verifyAttempt, true)
        })
    })
}

const saveSourceGithub = (codeId, verifiedSource, verifyAttempt) => {

    const createRepo = spawn(
        `cd verifyingId${codeId} && rm code${codeId}.zip &&
        gh repo create codeId${codeId} --confirm --public`
        , { shell: true }
    )

    // createRepo.stdout.on('data', data => console.log(`out:${data}`))
    // createRepo.stderr.on('data', data => console.log(`Err:${data}`))

    createRepo.on('close', () => {

        const gitInit = spawn(
            `cd verifyingId${codeId} && 
            git init && 
            git add . &&
            git commit -m "Add CodeId${codeId}"`
            , { shell: true }
        )

        // gitInit.stdout.on('data', data => console.log(`out:${data}`))
        // gitInit.stderr.on('data', data => console.log(`Err:${data}`))

        gitInit.on('close', code => {
            if (code != 0) {
                endVerification(codeId, verifyAttempt, true)
                throw "Can't init git"
            }

            const pushSource = spawn(
                `cd verifyingId${codeId} && 
                git remote add origin https://github.com/secretcontracts/codeId${codeId}.git &&
                git push origin master`
                , { shell: true })

            pushSource.on('close', code => {
                if (code != 0) {
                    endVerification(codeId, verifyAttempt, true)
                    throw "Can't push"
                }

                const getLink = spawn(
                    `cd verifyingId${codeId} && 
                    git rev-parse HEAD`
                    , { shell: true })

                getLink.stdout.on('data', async (data) => {
                    verifiedSource.githubLink = `https://github.com/secretcontracts/codeId${codeId}/tree/${data.toString().replaceAll('\n', '')}`
                    await verifiedSource.save()
                })

                getLink.on('close', (code) => {
                    endVerification(codeId, verifyAttempt, true)

                    if (code != 0) throw "Can't get commit id"
                })
            })
        })

    })

}

const endVerification = async (codeId, verifyAttempt, isSuccess = false) => {
    const deleteDir = spawn(
        `sudo rm -rf ./verifyingId${codeId}`
        , { shell: true }
    )

    verifyAttempt.status = isSuccess ? 'success' : 'failed'
    await verifyAttempt.save()

    checkOrder()
}

const checkOrder = async () => {
    const inOrder = await VerifyOrderModel.findOne({})

    if (inOrder) {
        const code = await CodeModel.findOne({ id: inOrder.codeId })

        const verifyAttempt = await VerifyAttemptModel.findById(inOrder.verifyAttemptId)
        verifyAttempt.status = 'onProgress'
        await verifyAttempt.save()

        verify(inOrder.zipDataBuffer.any.buffer, inOrder.builderVersion, code, verifyAttempt, inOrder.saveToGithub)

        await VerifyOrderModel.findByIdAndDelete(inOrder.id)
    }
}

module.exports = { verify, endVerification, checkOrder }
