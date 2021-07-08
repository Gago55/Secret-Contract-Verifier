import React, { FC, useRef, useState } from 'react'
import { connect } from 'react-redux'
import { StateType } from '../redux/store'
import { getVerifyAttempt } from '../redux/appReducer'
import { VerifyAttemptType } from '../api/appAPI'
import { useHistory } from 'react-router-dom'
import { Box, Paper, Typography } from '@material-ui/core'
import { CircularProgress } from '@material-ui/core'
import { useEffect } from 'react'
import { Line } from 'three'

interface IProps {
    attemptId: string | undefined
    actualVerifyAttempt: undefined | VerifyAttemptType

    getVerifyAttempt(id: string): void
}

const VerifyAttempt: FC<IProps> = ({ attemptId, actualVerifyAttempt, getVerifyAttempt }) => {

    const [intervalF, setIntervalF] = useState<null | NodeJS.Timeout>(null)
    const history = useHistory()

    const terminalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {

        if (actualVerifyAttempt && attemptId) {

            if (terminalRef.current)
                terminalRef.current.scrollTop = terminalRef.current.scrollHeight

            if (actualVerifyAttempt.status === 'onProgress') {
                // setIntervalF(
                setTimeout(() => {
                    getVerifyAttempt(attemptId)
                    console.log('onProgress')
                }, 5000)
                // )
            }
            else if (actualVerifyAttempt.status === 'inOrder') {
                // setIntervalF(
                setTimeout(() => {
                    getVerifyAttempt(attemptId)
                    console.log('inorder')
                }, 30000)
                // )
            }
            else if (intervalF) {
                clearInterval(intervalF)
            }
        }
    }, [actualVerifyAttempt])

    if (!attemptId || attemptId.length !== 24) {
        history.push('/')
        return <></>
    }

    if (!actualVerifyAttempt) {
        getVerifyAttempt(attemptId)
        return <></>
    }

    if (actualVerifyAttempt._id !== attemptId) {
        getVerifyAttempt(attemptId)
        return <></>
    }

    const viewLogs = (logs: Array<string>) => {
        const keyWords = [
            { text: 'Building' },
            { text: 'Updating', color: '#00f100' },
            { text: 'Downloading', color: '#00f100' },
            { text: 'Downloaded', color: '#00f100' },
            { text: 'Compiling', color: '#00f100' },
            { text: 'Something' },
            { text: 'warning', color: 'yellow' },
            { text: 'error', color: 'red' },
            { text: 'Finished', },
            { text: 'FALSE', color: 'red' },
            { text: 'TRUE', color: '#00f100' }
        ]
        const doubleReturn = ['\n\n']

        let str = logs.join(' ')

        keyWords.forEach(word => {
            str = str.replaceAll(word.text, word.color ? `\n<span style="color:${word.color}">${word.text}</span>` : '\n' + word.text)
        })

        str = str.replaceAll(new RegExp(doubleReturn.join('|'), 'g'), '\n')

        return str.split('\n').map(str => `${str}<br />`)
    }


    return (<>
        <Typography variant="h6" noWrap style={{ marginBottom: 5, display: 'flex', justifyContent: 'space-between' }}>
            <span>Verify Attempt logs for CodeID {actualVerifyAttempt.codeId}</span>
            <span>
                Status -
                <i style={{
                    fontWeight: 300,
                    color: actualVerifyAttempt.status === 'failed' ? 'red'
                        : actualVerifyAttempt.status === 'success' ? 'green' : 'black'
                }}>
                    {
                        actualVerifyAttempt.status === 'inOrder' ? ' inQueue'
                            : actualVerifyAttempt.status === 'onProgress' ? ' inProgress'
                                : ' ' + actualVerifyAttempt.status
                    }
                </i>
            </span>
        </Typography>
        <Box
            style={{
                position: 'relative',
                width: '100%',
            }}>
            <div
                ref={terminalRef}
                style={{
                    padding: 16,
                    width: '100%',
                    height: 600,
                    background: 'black',
                    color: 'white',
                    fontFamily: "Ubuntu Mono",
                    boxSizing: 'border-box',
                    overflowY: 'scroll',
                    wordBreak: 'break-all'
                }}
            >
                <span style={{ color: '#00f100' }}>root@secret-contracts</span>
                :<span style={{ color: '#0071f1' }}>/</span>{'$ '}date<br />
                {new Date(actualVerifyAttempt.date).toString()}<br />

                <span style={{ color: '#00f100' }}>root@secret-contracts</span>
                :<span style={{ color: '#0071f1' }}>/</span>{'$ '}
                {viewLogs(actualVerifyAttempt.logs).map(line => <div dangerouslySetInnerHTML={{ __html: line }} />)}
            </div>
            {(actualVerifyAttempt.status === 'onProgress' || actualVerifyAttempt.status === 'inOrder')
                && <CircularProgress style={{ position: 'absolute', right: 20, bottom: 5, color: 'white' }} size={20} disableShrink />
            }
        </Box>
    </>)
}

const mapStateToProps = (state: StateType) => ({
    actualVerifyAttempt: state.appReducer.actualVerifyAttempt
})

export default connect(mapStateToProps, { getVerifyAttempt })(VerifyAttempt)