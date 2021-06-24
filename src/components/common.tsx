import { Box, withStyles } from '@material-ui/core'
import CheckIconPath from '../assets/check.svg'
import DeleteIconPath from '../assets/delete.svg'

export const Shift = withStyles({
    root: {
        flexGrow: 1
    }
})(Box)

export const NoneVerifiedIcon = () => <img src={DeleteIconPath} width={22} alt='Gag' />
export const IsVerifiedIcon = () => <img src={CheckIconPath} width={22} alt='Gag' />