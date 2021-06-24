import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@material-ui/core'
import React, { FC, useEffect } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { compose } from 'redux'
import { CodeType, ContractType } from '../api/appAPI'
import { actions, getCodeByContractAddress, verify } from '../redux/appReducer'
import { StateType } from '../redux/store'
import Code from './Code'
import Contract from './Contract'
import Source from './Source'

interface IProps {
    address: any
    actualCode?: CodeType

    getCodeByContractAddress(address: string): void
    verify(codeId: number, zipData: FormData): void
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
        <Source isVerified={props.actualCode.isVerified} codeId={props.actualCode.id} address={contract.address} verify={props.verify} />
    </Box>
    )


}

const mapStateToProps = (state: StateType) => ({
    actualCode: state.appReducer.actualCode
})

export default compose(
    connect(mapStateToProps, { getCodeByContractAddress, verify })
)(DetailedView)