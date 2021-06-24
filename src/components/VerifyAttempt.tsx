import React, { FC } from 'react'
import { Box, Paper } from "@material-ui/core"

interface IProps {
    attemptId: string | undefined
}

const VerifyAttempt: FC<IProps> = props => {

    console.log(props.attemptId)
    return (
        <Paper>
            {props.attemptId}
        </Paper>
    )
}

export default VerifyAttempt