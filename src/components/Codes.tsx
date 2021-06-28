import { Box, Button, Collapse, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Typography } from '@material-ui/core'
import IconButton from '@material-ui/core/IconButton'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import React, { FC, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { CodeType, ContractType } from '../api/appAPI'
import { actions, getCodes } from '../redux/appReducer'
import { StateType } from '../redux/store'
import { IsVerifiedIcon, NoneVerifiedIcon } from './common'

interface IProps {
    codes: Array<CodeType>

    getCodes(): void
    setActualCodeById(codeId: number): void
}

interface IRowProps {
    row: RowDataType
    contracts: Array<ContractType>

    setActualCodeById(codeId: number): void
}

interface ISortedTableHeadProps {
    classes: ReturnType<typeof useStyles>
    onRequestSort: (
        event: React.MouseEvent<unknown>,
        property: OrderByType
    ) => void
    order: Order
    orderBy: string
}

interface HeadCellType {
    id: OrderByType
    label: string
    align: 'left' | 'right' | 'center'
}

interface RowDataType {
    id: number
    contractsCount: number
    isVerified: string
    contracts: Array<ContractType>
}

type Order = "asc" | "desc"
type OrderByType = 'id' | 'contractsCount' | 'isVerified'

type GetComparatorReturnType = (
    a: { [key in OrderByType]: number | string },
    b: { [key in OrderByType]: number | string }
) => number


const useRowStyles = makeStyles({
    root: {
        // '& > *': {
        //     borderBottom: 'unset',
        // },
    },
})

const useStyles = makeStyles({
    visuallyHidden: {
        border: 0,
        clip: "rect(0 0 0 0)",
        height: 1,
        margin: -1,
        overflow: "hidden",
        padding: 0,
        position: "absolute",
        top: 20,
        width: 1
    }
})

const Row: FC<IRowProps> = ({ row, contracts, setActualCodeById }) => {
    const classes = useRowStyles()

    const [open, setOpen] = useState(false)

    const history = useHistory()
    const handleOnClick = (address: string) => history.push('/contracts/' + address)

    return (
        <>
            <TableRow className={classes.root} hover onClick={() => { setOpen(!open) }}>
                <TableCell width='30px'>
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    {row.id}
                </TableCell>
                <TableCell align='right'>{row.contractsCount}</TableCell>
                <TableCell align='center'>
                    {row.isVerified == 'true' && <IsVerifiedIcon />}
                    {row.isVerified == 'false' && <NoneVerifiedIcon />}
                </TableCell>
                {/* <TableCell align='center' >
                    {row.isVerified == 'true' && <Button variant='contained' color='primary'>Show</Button>}
                    {row.isVerified == 'false' && <Button variant='contained' color='primary'>Provide</Button>}
                </TableCell> */}
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingLeft: 100, paddingRight: 100, paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box margin={1}>
                            <Typography variant="h6" gutterBottom component="div">
                                Contracts
                            </Typography>
                            <Paper elevation={2}>
                                <Table size="small" aria-label="purchases">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Address</TableCell>
                                            <TableCell>Label</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {contracts.map((contract) => (
                                            <TableRow key={contract.address} hover onClick={() => {
                                                setActualCodeById(row.id)
                                                handleOnClick(contract.address)
                                            }}>
                                                <TableCell component="th" scope="row">
                                                    {contract.address}
                                                </TableCell>
                                                <TableCell>{contract.label}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Paper>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    )
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1
    }
    if (b[orderBy] > a[orderBy]) {
        return 1
    }
    return 0
}

const getComparator = (order: Order, orderBy: OrderByType): GetComparatorReturnType => {
    return order === "desc"
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy)
}

function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number])
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0])
        if (order !== 0) return order
        return a[1] - b[1]
    })
    return stabilizedThis.map((el) => el[0])
}

const headCells = [
    {
        id: "id",
        align: 'left',
        label: "ID"
    },
    {
        id: "contractsCount",
        align: 'right',
        label: "Contracts Count"
    },
    {
        id: "isVerified",
        align: 'center',
        label: "Is Verified"
    }
] as Array<HeadCellType>

const SortedTableHead: FC<ISortedTableHeadProps> = ({ classes, order, orderBy, onRequestSort }) => {

    const createSortHandler = (property: OrderByType) => (event: React.MouseEvent<unknown>) => { onRequestSort(event, property) }

    return (
        <TableHead>
            <TableRow>
                <TableCell />
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.align}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : "asc"}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <span className={classes.visuallyHidden}>
                                    {order === "desc" ? "sorted descending" : "sorted ascending"}
                                </span>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
                {/* <TableCell align='center' >Action</TableCell> */}
            </TableRow>
        </TableHead>
    )
}

const Codes: FC<IProps> = props => {
    const classes = useStyles()

    const [order, setOrder] = React.useState<Order>("asc")
    const [orderBy, setOrderBy] = React.useState<OrderByType>("id")
    const [rows, setRows] = useState<Array<RowDataType>>([])

    const handleRequestSort = (event: React.MouseEvent<unknown>, property: OrderByType) => {
        const isAsc = orderBy === property && order === "asc"
        setOrder(isAsc ? "desc" : "asc")
        setOrderBy(property)

        setRows(stableSort(rows, getComparator(isAsc ? "desc" : "asc", property)))
    }

    useEffect(() => {
        if (!props.codes.length)
            props.getCodes()
        else {
            const newRows = [] as Array<RowDataType>

            props.codes.forEach(code => newRows.push({
                id: code.id,
                contractsCount: code.contracts.length,
                isVerified: code.isVerified.toString(),
                contracts: code.contracts
            }))

            setRows(newRows)
        }

    }, [props.codes])

    return (
        <>
            <Typography variant="h6" noWrap style={{ marginBottom: 5 }}>
                Codes
            </Typography>
            <TableContainer component={Paper}>
                <Table
                // size="small"
                >
                    <SortedTableHead
                        classes={classes}
                        order={order}
                        orderBy={orderBy}
                        onRequestSort={handleRequestSort}
                    />
                    <TableBody>
                        {rows.map((row, i) => (
                            <Row
                                key={row.id}
                                row={row}
                                contracts={row.contracts}
                                setActualCodeById={props.setActualCodeById}
                            />
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