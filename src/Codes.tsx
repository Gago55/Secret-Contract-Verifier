import { Box, Button, Collapse, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@material-ui/core'
import IconButton from '@material-ui/core/IconButton'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import React, { FC, useCallback, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { NavLink, useHistory } from 'react-router-dom'
import { CodeType } from './api/appAPI'
import { getCodes, actions } from './redux/appReducer'
import { StateType } from './redux/store'

interface IProps {
    codes: Array<CodeType>

    getCodes(): void
    setActualCodeById(codeId: number): void
}

interface IRowProps {
    row: CodeType

    setActualCodeById(codeId: number): void
}

const useRowStyles = makeStyles({
    root: {
        '& > *': {
            borderBottom: 'unset',
        },

    },
});

const Row: FC<IRowProps> = ({ row, setActualCodeById }) => {
    const classes = useRowStyles();

    const [open, setOpen] = useState(false)

    const history = useHistory();
    const handleOnClick = (address: string) => history.push('/' + address)

    return (
        <>
            <TableRow className={classes.root} hover onClick={() => { setOpen(!open) }}>
                <TableCell width='30px'>
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell align='center' component="th" scope="row">
                    {row.id}
                </TableCell>
                <TableCell align='center' >{row.contracts.length}</TableCell>
                <TableCell align='center' >{row.isVerified.toString()}</TableCell>
                <TableCell align='center' >
                    {row.isVerified && <Button>Show</Button>}
                    {!row.isVerified && <Button>Provide</Button>}
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell id="gag" style={{ paddingLeft: 100, paddingRight: 100, paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box margin={1}>
                            <Typography variant="h6" gutterBottom component="div">
                                Contracts
                            </Typography>
                            {/* <TableContainer component={Paper}> */}
                            <Paper elevation={2}>
                                <Table size="small" aria-label="purchases">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Address</TableCell>
                                            <TableCell>Label</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {row.contracts.map((contract) => (
                                            // <NavLink to={`/` + contract.address} >
                                            <TableRow key={contract.address} hover onClick={() => {
                                                setActualCodeById(row.id)
                                                handleOnClick(contract.address)
                                            }}>
                                                <TableCell component="th" scope="row">
                                                    {contract.address}
                                                </TableCell>
                                                <TableCell>{contract.label}</TableCell>
                                            </TableRow>
                                            // </NavLink>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Paper>
                            {/* </TableContainer> */}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    )
}

const Codes: FC<IProps> = props => {

    useEffect(() => {
        props.getCodes()
    }, [])

    return (
        <>
            <Typography variant="h6" noWrap style={{ marginBottom: 5 }}>
                Codes
          </Typography>
            <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell align='center'>ID</TableCell>
                            <TableCell align='center'>Contracts count</TableCell>
                            <TableCell align='center'>Is Verified</TableCell>
                            <TableCell align='center'>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {props.codes.map((row: CodeType) => (
                            <Row key={row.id} row={row} setActualCodeById={props.setActualCodeById} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}

const mapStateToProps = (state: StateType) => ({
    codes: state.appReducer.codes
})

export default connect(mapStateToProps, { getCodes, setActualCodeById: actions.setActualCodeById })(Codes)