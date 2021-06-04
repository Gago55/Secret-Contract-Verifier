import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@material-ui/core'
import React, { FC } from 'react'

interface IProps {
    codeID: number
    label: string
    isVerificated: boolean
    address: string
    hash: string
}

const Contract: FC<IProps> = props => {
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
                        <TableCell align="right">{props.label}</TableCell>
                    </TableRow>
                    <TableRow >
                        <TableCell component="th" scope="row">CodeID</TableCell>
                        <TableCell align="right">{props.codeID}</TableCell>
                    </TableRow>
                    <TableRow >
                        <TableCell component="th" scope="row">Hash</TableCell>
                        <TableCell align="right">{props.hash}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </Paper>
    )
}

export default Contract