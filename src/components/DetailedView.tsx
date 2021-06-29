import { Box, Button, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@material-ui/core'
import React, { FC, useEffect } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { compose } from 'redux'
import { CodeType, ContractType, SourceDataType, VerifyAttemptType } from '../api/appAPI'
import { actions, getCodeByContractAddress, getSourceData, getVerifyAttemptsByCodeId, verify, VerifyResponseType } from '../redux/appReducer'
import { StateType } from '../redux/store'
import Code from './Code'
import Contract from './Contract'
import Source from './Source'
import { VerifyAttemptsTable } from './VerifyAttempts'
import { Shift } from './common'
import { useSnackbar } from 'notistack'

const useStyles = makeStyles({
    allVerifyAttemptsSpan: {
        // margin: 10,
        fontWeight: 'bolder',
        color: '#3498db',
        '&:hover': {
            cursor: 'pointer'
        }
    }
})

interface IProps {
    address: string | undefined
    actualCode?: CodeType
    actualSourceData?: SourceDataType
    verifyResponse: VerifyResponseType
    verifyResponseError: string
    actualCodeVerifyAttempts: Array<VerifyAttemptType>
    getContractError: string

    getCodeByContractAddress(address: string): void
    verify(codeId: number, zipData: FormData): void
    setVerifyResponse(status: number, id: string, onProgressId: string): void
    setVerifyResponseError(msg: string): void
    getSourceData(codeId: number | string): void
    getVerifyAttemptsByCodeId(codeId: number): void
}

const DetailedView: FC<IProps> = props => {
    const classes = useStyles()

    const history = useHistory()
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    // useEffect(()=>{

    // },[])  

    useEffect(() => {
        if (props.actualCode)
            props.getVerifyAttemptsByCodeId(props.actualCode.id)
    }, [props.actualCode])


    if (!props.address)
        return <></>


    if (props.address.length !== 45 || props.address.slice(0, 6) !== 'secret')
        history.push('/')

    if (!props.actualCode) {
        if (!props.getContractError) {
            props.getCodeByContractAddress(props.address)
            return <></>
        }
        else {
            enqueueSnackbar(props.getContractError, {
                variant: 'error',
                anchorOrigin: {
                    horizontal: 'center',
                    vertical: 'bottom'
                },
                autoHideDuration: 7000,
                onClose: () => { history.push('/') }
            })

            return <></>
        }
    }

    const contract = props.actualCode.contracts.find(c => c.address == props.address) as ContractType

    return (<Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', rowGap: 30 }}>

        <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', columnGap: 30 }}>
            <Contract contract={contract} />
            <Code code={props.actualCode} />
        </Box>
        <Source
            isVerified={props.actualCode.isVerified}
            codeId={props.actualCode.id}
            address={contract.address}
            verify={props.verify}
            verifyResponse={props.verifyResponse}
            setVerifyResponse={props.setVerifyResponse}
            verifyResponseError={props.verifyResponseError}
            setVerifyResponseError={props.setVerifyResponseError}
            actualSourceData={props.actualSourceData}
            getSourceData={props.getSourceData}
        />
        <Paper style={{ width: '100%', padding: 15 }}>
            <Typography variant="h6" style={{ marginBottom: 15 }}>
                Verify Attempts
            </Typography>
            <VerifyAttemptsTable verifyAttempts={props.actualCodeVerifyAttempts} isSmall />
            <Box mt={2} style={{ display: 'flex' }}>
                <Shift />
                <span
                    className={classes.allVerifyAttemptsSpan}
                    onClick={() => { history.push('/verifyattempts') }}
                >
                    All Verify Attempts
                </span>
            </Box>

        </Paper>
    </Box>
    )
}

const mapStateToProps = (state: StateType) => ({
    actualCode: state.appReducer.actualCode,
    actualSourceData: state.appReducer.actualSourceData,
    verifyResponse: state.appReducer.verifyResponse,
    verifyResponseError: state.appReducer.verifyResponseError,
    actualCodeVerifyAttempts: state.appReducer.actualCodeVerifyAttempts,
    getContractError: state.appReducer.getContractError
})

export default connect(mapStateToProps, {
    getCodeByContractAddress,
    verify,
    setVerifyResponse: actions.setVerifyResponse,
    setVerifyResponseError: actions.setVerifyResponseError,
    getSourceData,
    getVerifyAttemptsByCodeId
})(DetailedView)