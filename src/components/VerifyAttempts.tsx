import React, { FC, useState } from 'react'
import { useEffect } from 'react'
import { connect } from 'react-redux'
import { VerifyAttemptType } from '../api/appAPI'
import { getVerifyAttempts } from '../redux/appReducer'
import { StateType } from '../redux/store'
import { Box, Button, Collapse, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Typography } from '@material-ui/core'
import { useHistory } from 'react-router-dom'


type Order = "asc" | "desc"
type OrderByType = 'id' | 'codeId' | 'status' | 'date'

type GetComparatorReturnType = (
    a: { [key in OrderByType]: number | string },
    b: { [key in OrderByType]: number | string }
) => number

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

const useRowStyles = makeStyles({
    root: {
        // '& > *': {
        //     borderBottom: 'unset',
        // },
    },
})

interface IRowProps {
    verifyAttempt: RowDataType
}

const Row: FC<IRowProps> = ({ verifyAttempt }) => {
    const classes = useRowStyles()

    const history = useHistory()
    const handleRowClick = (id: string) => history.push('/verifyattempts/' + id)

    return (
        <>
            <TableRow className={classes.root} hover onClick={() => { handleRowClick(verifyAttempt.id) }}>
                <TableCell align='center'> {verifyAttempt.id} </TableCell>
                <TableCell align='center'>{verifyAttempt.codeId}</TableCell>
                <TableCell align='center'>{verifyAttempt.status === 'inOrder' ? 'inQueue' : verifyAttempt.status}</TableCell>
                <TableCell align='center'>{new Date(verifyAttempt.date).toLocaleString(undefined, { hour12: false })}</TableCell>
            </TableRow>
        </>
    )
}

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

interface ISortedTableHeadProps {
    classes: ReturnType<typeof useStyles>
    onRequestSort: (
        property: OrderByType
    ) => void
    order: Order
    orderBy: string
}

interface HeadCellType {
    id: OrderByType
    label: string
    alignRight: boolean
}

const headCells = [
    {
        id: "id",
        alignRight: false,
        label: "ID"
    },
    {
        id: "codeId",
        alignRight: false,
        label: "Code ID"
    },
    {
        id: "status",
        alignRight: false,
        label: "Status"
    },
    {
        id: "date",
        alignRight: false,
        label: "Date"
    }
] as Array<HeadCellType>


const SortedTableHead: FC<ISortedTableHeadProps> = ({ classes, order, orderBy, onRequestSort }) => {

    const createSortHandler = (property: OrderByType) => (event: React.MouseEvent<unknown>) => { onRequestSort(property) }

    return (
        <TableHead>
            <TableRow>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        // align={headCell.alignRight ? 'right' : 'left'}
                        align='center'
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
            </TableRow>
        </TableHead>
    )
}

interface RowDataType {
    id: string
    codeId: number
    status: string
    date: number
}

interface IVerifyAttemptsTableProps {
    verifyAttempts: Array<VerifyAttemptType>
    isSmall?: boolean
}

export const VerifyAttemptsTable: FC<IVerifyAttemptsTableProps> = ({ verifyAttempts, isSmall }) => {
    const classes = useStyles()

    const [order, setOrder] = useState<Order>("desc")
    const [orderBy, setOrderBy] = useState<OrderByType>("date")
    const [rows, setRows] = useState<Array<RowDataType>>([])

    const handleRequestSort = (property: OrderByType) => {
        const isAsc = orderBy === property && order === "asc"
        setOrder(isAsc ? "desc" : "asc")
        setOrderBy(property)

        setRows(stableSort(rows, getComparator(isAsc ? "desc" : "asc", property)))
    }

    useEffect(() => {

        const newRows = [] as Array<RowDataType>

        verifyAttempts.forEach(attempt => newRows.push({
            id: attempt._id,
            codeId: attempt.codeId,
            status: attempt.status,
            date: new Date(attempt.date).getTime()
        }))

        setRows(stableSort(newRows, getComparator(order, orderBy)))

    }, [verifyAttempts])

    return (
        <TableContainer component={Paper}>
            <Table
                size={isSmall ? "small" : 'medium'}
            >
                <SortedTableHead
                    classes={classes}
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={handleRequestSort}
                />
                <TableBody>
                    {rows.map((row) => (
                        <Row
                            key={row.id}
                            verifyAttempt={row}
                        />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

interface IProps {
    verifyAttempts: Array<VerifyAttemptType>

    getVerifyAttempts(): void
}

const VerifyAttempts: FC<IProps> = props => {

    useEffect(() => {
        if (!props.verifyAttempts.length)
            props.getVerifyAttempts()
    }, [props.verifyAttempts])

    return (
        <>
            <Typography variant="h6" noWrap style={{ marginBottom: 5 }}>
                Verify Attempts
            </Typography>
            <VerifyAttemptsTable verifyAttempts={props.verifyAttempts} />
        </>
    )
}

const mapStateToProps = (state: StateType) => ({
    verifyAttempts: state.appReducer.verifyAttempts
})

export default connect(mapStateToProps, {
    getVerifyAttempts
})(VerifyAttempts)