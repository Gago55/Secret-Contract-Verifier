import { Paper, Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import React, { FC } from 'react'
import { ContractType } from '../api/appAPI'

interface IProps {
    contract: ContractType
}

const Contract: FC<IProps> = ({ contract }) => {

    return (
        <Paper style={{ maxWidth: 800, height: 'fit-content' }}>
            <Table >
                <TableBody>
                    <TableRow >
                        <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Contract Overview</TableCell>
                        <TableCell align="right"></TableCell>
                    </TableRow>
                    <TableRow >
                        <TableCell component="th" scope="row">Address</TableCell>
                        <TableCell align="right">{contract.address}</TableCell>
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
                        <TableCell component="th" scope="row">Creator</TableCell>
                        <TableCell align="right">{contract.creator}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </Paper>
    )


}

export default Contract