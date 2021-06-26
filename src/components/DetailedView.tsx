import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@material-ui/core'
import React, { FC, useEffect } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { compose } from 'redux'
import { CodeType, ContractType, SourceDataType } from '../api/appAPI'
import { actions, getCodeByContractAddress, getSourceData, verify, VerifyResponseType } from '../redux/appReducer'
import { StateType } from '../redux/store'
import Code from './Code'
import Contract from './Contract'
import Source from './Source'

interface IProps {
    address: string | undefined
    actualCode?: CodeType
    actualSourceData?: SourceDataType
    verifyResponse: VerifyResponseType
    verifyResponseError: string

    getCodeByContractAddress(address: string): void
    verify(codeId: number, zipData: FormData): void
    setVerifyResponse(status: number, id: string, onProgressId: string): void
    setVerifyResponseError(msg: string): void
    getSourceData(codeId: number | string): void
}

const DetailedView: FC<IProps> = props => {

    const history = useHistory()

    // useEffect(()=>{

    // },[])
    if (!props.address)
        return <></>


    if (props.address.length !== 45 || props.address.slice(0, 6) !== 'secret')
        history.push('/')

    if (!props.actualCode) {
        props.getCodeByContractAddress(props.address)
        return <></>
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
    </Box>
    )
}

const mapStateToProps = (state: StateType) => ({
    actualCode: state.appReducer.actualCode,
    actualSourceData: state.appReducer.actualSourceData,
    verifyResponse: state.appReducer.verifyResponse,
    verifyResponseError: state.appReducer.verifyResponseError,
})

export default connect(mapStateToProps, {
    getCodeByContractAddress,
    verify,
    setVerifyResponse: actions.setVerifyResponse,
    setVerifyResponseError: actions.setVerifyResponseError,
    getSourceData
})(DetailedView)