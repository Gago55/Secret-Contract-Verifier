import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@material-ui/core'
import React, { FC, useEffect } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { compose } from 'redux'
import { CodeType, ContractType } from '../api/appAPI'
import { actions, getCodeByContractAddress } from '../redux/appReducer'
import { StateType } from '../redux/store'

interface IProps {
    address: any
    actualCode?: CodeType

    getCodeByContractAddress(address: string): void
}

const Contract: FC<IProps> = props => {

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

    return (
        <Paper style={{ maxWidth: 700 }}>
            <Table >
                <TableBody>
                    <TableRow >
                        <TableCell component="th" scope="row">Address</TableCell>
                        <TableCell align="right">{props.address}</TableCell>
                    </TableRow>
                    <TableRow >
                        <TableCell component="th" scope="row">Label</TableCell>
                        <TableCell align="right">{contract.label}</TableCell>
                    </TableRow>
                    <TableRow >
                        <TableCell component="th" scope="row">CodeID</TableCell>
                        <TableCell align="right">{contract.codeId}</TableCell>
                    </TableRow>
                    <TableRow >
                        <TableCell component="th" scope="row">Hash</TableCell>
                        <TableCell align="right">{props.actualCode.checksum}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </Paper>
    )


}

const mapStateToProps = (state: StateType) => ({
    actualCode: state.appReducer.actualCode
})

export default compose(
    connect(mapStateToProps, { getCodeByContractAddress }),
    // withRouter
)(Contract)