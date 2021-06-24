import { Box, makeStyles, Paper, Typography, CircularProgress, Dialog, DialogTitle, Slide, DialogActions, DialogContentText, DialogContent, MenuItem, Button, FormControl, InputLabel, Select } from '@material-ui/core'
import JSZip from 'jszip'
import React, { ChangeEvent, FC, useState } from 'react'
import { useSnackbar, VariantType } from 'notistack'
import { TransitionProps } from '@material-ui/core/transitions/transition'

interface IProps {
    isVerified: boolean
    codeId: number
    address: string

    verify(codeId: number, zipData: FormData): void
}

const useStyles = makeStyles({
    verify: {
        fontWeight: 'bolder',
        color: '#3498db',
        '&:hover': {
            cursor: 'pointer'
        }
    }
})

const TransitionUp = (props: TransitionProps) => {
    return <Slide {...props} direction="up" />
}

const Source: FC<IProps> = ({ isVerified, codeId, address, verify }) => {
    const classes = useStyles()

    type BuilderVersionType = '1.0.0' | '1.0.1' | '1.0.2' | '1.0.3' | '1.0.4'

    const [verifyDialogOpen, setVerifyDialogOpen] = useState(true)
    const [fileName, setFileName] = useState('')
    const [builderVersion, setBuilderVersion] = useState<BuilderVersionType | ''>('')
    const [zipData, setZipData] = useState<FormData | null>(null)
    const [loading, setLoading] = useState(false)

    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    const showMessage = (message: string, variant: VariantType = 'error', duartion: number = 7000) => {
        enqueueSnackbar(message, {
            variant,
            TransitionComponent: TransitionUp,
            anchorOrigin: {
                horizontal: 'center',
                vertical: 'bottom'
            },
            autoHideDuration: duartion
        })
    }

    const onVerifyAndPublishClick = () => {
        setVerifyDialogOpen(true)
    }

    const onBuilderVersionChange = (event: ChangeEvent<{ value: unknown }>) => {
        setBuilderVersion(event.target.value as BuilderVersionType)
    }

    const onUploadClick = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.zip'
        input.onchange = (e: any) => { onZipChange(e) }
        input.style.opacity = '0'
        input.click()
    }

    const onZipChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return

        let file = e.target.files[0]

        setLoading(true)
        setZipData(null)
        setFileName(file.name)

        const zipToFormData = (zip: JSZip) => {
            zip.generateAsync({ type: "blob" }).then((blob: Blob) => {
                const myFormData = new FormData()
                myFormData.append('zipData', blob)
                myFormData.append('builderVersion', builderVersion)

                setZipData(myFormData)
                setLoading(false)
            })
        }

        const jsZip = new JSZip()
        jsZip.loadAsync(file).then(zip => {

            if (zip.files['Cargo.toml']) {

                if (zip.files['target/']) {
                    zip.remove('target')
                }

                if (zip.files['.git/']) {
                    zip.remove('.git')
                }

                zipToFormData(zip)
            }
            else {
                let folderName = null as null | string
                let isOneFolder = true

                for (const prop in zip.files) {

                    if (!folderName)
                        folderName = prop.split('/')[0]
                    else if (folderName !== prop.split('/')[0]) {
                        isOneFolder = false
                        break
                    }
                }

                if (isOneFolder) {
                    if (zip.files[folderName + '/Cargo.toml']) {

                        if (zip.files[folderName + '/target/']) {
                            zip.remove(folderName + '/target')
                        }

                        if (zip.files[folderName + '/.git/']) {
                            zip.remove(folderName + '/.git')
                        }

                        zipToFormData(zip)
                    }
                    else {
                        showMessage('There isn\'t Cargo.toml file')
                        setFileName('')
                        setLoading(false)
                    }
                }
                else {
                    showMessage('Wrong ZIP')
                    setFileName('')
                    setLoading(false)
                }
            }

        })
    }

    const onVerifyClick = () => {
        if (!builderVersion) {
            showMessage('Choose Builder Version!', undefined, 4000)
            return
        }

        if (!zipData) {
            showMessage('Upload Source Code!', undefined, 4000)
            return
        }

        verify(codeId, zipData)
    }

    return (<>
        <Paper style={{ width: '100%', padding: 15 }}>
            <Typography variant="h6" style={{ marginBottom: 15 }}>
                Source Code
            </Typography>
            {!isVerified && <>
                <Typography variant="body2">
                    CodeID is not verified.
                </Typography>
                <Typography variant="body2">
                    Are you the contract creator?
                    <span
                        className={classes.verify}
                        onClick={onVerifyAndPublishClick}
                    > Verify and Publish</span> your contract source code now!
                </Typography>
            </>}
        </Paper>
        <Dialog
            open={verifyDialogOpen}
            onClose={() => { setVerifyDialogOpen(false) }}
        >
            <DialogTitle id="form-dialog-title">Verifying Source Code</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Source code verification provides transparency for users interacting with smart contracts. By uploading the source code, site will match the compiled code with that on the blockchain.
                </DialogContentText>
                <hr style={{ height: '1px', border: 0, borderTop: '1px solid hsl(0,0%,80%)', width: '100%' }} />
                <DialogContentText color='textPrimary'>
                    CodeID - <b>{codeId}</b><br />
                    Contract Address - <b>{address}</b>
                </DialogContentText>

                <Box style={{ display: 'flex', alignItems: 'center', columnGap: 15 }}>
                    <Typography> Choose secret-contract-optimizer version </Typography>
                    <FormControl variant="outlined" style={{ minWidth: 150 }}>
                        <InputLabel id="demo-simple-select-outlined-label">Builder Version</InputLabel>
                        <Select
                            labelId="demo-simple-select-outlined-label"
                            id="demo-simple-select-outlined"
                            value={builderVersion}
                            onChange={onBuilderVersionChange}
                            label="Builder Version"
                        >
                            <MenuItem value={'1.0.0'}>1.0.0</MenuItem>
                            <MenuItem value={'1.0.1'}>1.0.1</MenuItem>
                            <MenuItem value={'1.0.2'}>1.0.2</MenuItem>
                            <MenuItem value={'1.0.3'}>1.0.3</MenuItem>
                            <MenuItem value={'1.0.4'}>1.0.4</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Box mt={2} style={{ display: 'flex', alignItems: 'center', columnGap: 15 }}>
                    <Typography> Choose zip file with source code. </Typography>
                    <Button color="primary" onClick={onUploadClick}>Upload</Button>
                    {loading && <CircularProgress size={20} />}
                    {!loading && <Typography><i>{fileName}</i></Typography>}
                </Box>

            </DialogContent>
            <DialogActions>
                <Button color="primary" variant='contained' onClick={onVerifyClick}>Verify</Button>
            </DialogActions>
        </Dialog>
    </>
    )
}

export default Source