import React, { FC, useState } from 'react'
import { AppBar, fade, InputBase, makeStyles, Toolbar, Typography } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import { Shift } from './common'

interface IProps {

}

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        display: 'block',
        '&:hover': {
            cursor: 'pointer'
        }
    },
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(1),
            width: 'auto',
        },
    },
    searchIcon: {
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '45ch',
            // '&:focus': {
            //     width: '50ch',
            // },
        },
    },
}))

const Header: FC<IProps> = props => {
    const classes = useStyles()

    const [searchValue, setSearchValue] = useState('')

    const onNameClick = () => {
        window.location.href = '/'
    }

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography className={classes.title} variant="h6" noWrap onClick={onNameClick}>
                    Secret Contracts
                </Typography>
                <Shift />
                <div className={classes.search}>
                    <div className={classes.searchIcon}>
                        <SearchIcon />
                    </div>
                    <InputBase
                        placeholder="Enter contract address..."
                        classes={{
                            root: classes.inputRoot,
                            input: classes.inputInput,
                        }}
                        value={searchValue}
                        onChange={(e) => { setSearchValue(e.currentTarget.value) }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                if (searchValue.length === 45 && searchValue.slice(0, 6) === 'secret')
                                    window.location.href = '/contracts/' + searchValue
                            }
                        }}
                        inputProps={{ 'aria-label': 'search' }}
                    />
                </div>
            </Toolbar>
        </AppBar>
    )
}

export default Header