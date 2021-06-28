import { SvgIcon, Paper, Box, Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import React, { FC } from 'react'
import { CodeType } from '../api/appAPI'
import { StateType } from '../redux/store'
import { NoneVerifiedIcon, IsVerifiedIcon } from './common'

interface IProps {
    code: CodeType
}

const Code: FC<IProps> = ({ code }) => {

    return (
        <>
            <Paper style={{ maxWidth: 800 }}>
                <Table >
                    <TableBody>
                        <TableRow >
                            <TableCell component="th" scope="row" style={{ fontWeight: 'bold' }}>Code Overview</TableCell>
                            <TableCell align="right">
                                <Box style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    columnGap: 5
                                }}>
                                    {code.isVerified && <>Verified <IsVerifiedIcon /></>}
                                    {!code.isVerified && <>Not Verified <NoneVerifiedIcon /></>}
                                </Box>
                            </TableCell>
                        </TableRow>
                        <TableRow >
                            <TableCell component="th" scope="row">Id</TableCell>
                            <TableCell align="right">{code.id}</TableCell>
                        </TableRow>
                        <TableRow >
                            <TableCell component="th" scope="row">Data Hash</TableCell>
                            <TableCell align="right">{code.checksum}</TableCell>
                        </TableRow>
                        <TableRow >
                            <TableCell component="th" scope="row">Creator</TableCell>
                            <TableCell align="right">{code.creator}</TableCell>
                        </TableRow>
                        <TableRow >
                            <TableCell component="th" scope="row">Source</TableCell>
                            <TableCell align="right">{code.source || '_'}</TableCell>
                        </TableRow>
                        <TableRow >
                            <TableCell component="th" scope="row">Builder</TableCell>
                            <TableCell align="right">{code.builder || '_'}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Paper>

        </>
    )


}

const mapStateToProps = (state: StateType) => ({
    actualCode: state.appReducer.actualCode
})

export default Code