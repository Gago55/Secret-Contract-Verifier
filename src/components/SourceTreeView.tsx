import { Backdrop, Box, Button, CircularProgress, makeStyles, Typography } from '@material-ui/core'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import ArrowRightIcon from '@material-ui/icons/ArrowRight'
import CodeIcon from '@material-ui/icons/Code'
import FolderOpenIcon from '@material-ui/icons/FolderOpen'
import GitHub from '@material-ui/icons/GitHub'
import { TreeItem, TreeView } from '@material-ui/lab'
import JSZip, { JSZipObject } from 'jszip'
import React, { FC, useEffect, useState } from 'react'
import { SourceDataType } from '../api/appAPI'
import { Shift } from './common'

const useTreeItemStyles = makeStyles((theme) => ({
    root: {
        color: theme.palette.text.secondary,
        '&:hover > $content': {
            backgroundColor: theme.palette.action.hover,
        },
        '&:focus > $content, &$selected > $content': {
            backgroundColor: `var(--tree-view-bg-color, ${theme.palette.grey[400]})`,
            color: 'var(--tree-view-color)',
        },
        '&:focus > $content $label, &:hover > $content $label, &$selected > $content $label': {
            backgroundColor: 'transparent',
        },
    },
    content: {
        color: theme.palette.text.secondary,
        borderTopRightRadius: theme.spacing(2),
        borderBottomRightRadius: theme.spacing(2),
        paddingRight: theme.spacing(1),
        fontWeight: theme.typography.fontWeightMedium,
        '$expanded > &': {
            fontWeight: theme.typography.fontWeightRegular,
        },
    },
    group: {
        marginLeft: 15,
        '& $content': {
            paddingLeft: theme.spacing(2),
        },
    },
    expanded: {
    },
    selected: {},
    label: {
        fontWeight: 'inherit',
        color: 'inherit',
    },
    labelRoot: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0.5, 0),

    },
    labelIcon: {
        marginRight: theme.spacing(1),
    },
    labelText: {
        fontWeight: 'inherit',
        flexGrow: 1,
        '$expanded > &': {
            marginLeft: 10
        },
    },
}))

function StyledTreeItem(props: any) {
    const classes = useTreeItemStyles()
    const { labelText, labelIcon: LabelIcon, labelInfo, color, bgColor, ...other } = props

    return (
        <TreeItem
            label={
                <div className={classes.labelRoot}>
                    <LabelIcon color="inherit" className={classes.labelIcon} />
                    <Typography variant="body2" className={classes.labelText}>
                        {labelText}
                    </Typography>
                    <Typography variant="caption" color="inherit">
                        {labelInfo}
                    </Typography>
                </div>
            }
            style={{
                '--tree-view-color': color,
                '--tree-view-bg-color': bgColor,
            }}
            classes={{
                root: classes.root,
                content: classes.content,
                expanded: classes.expanded,
                selected: classes.selected,
                group: classes.group,
                label: classes.label,
            }}
            {...other}
        />
    )
}

const useStyles = makeStyles({
    root: {
        height: 264,
        flexGrow: 1,
        maxWidth: 200,
        marginRight: 20
    },
    backdrop: {
        position: 'absolute',
        zIndex: 'auto',
        color: '#fff',
    },
    fileContent: {
        background: '#f8f9fa', height: 560, overflowY: 'auto',
        border: '1px solid',
        borderRadius: 4,
        borderColor: '#bfbfc0',
        whiteSpace: 'pre-wrap',
        padding: 10
    }
})

type JSZipFilesType = { [key: string]: JSZipObject }
type FileStructType<T> = { [key: string]: T }
interface IFileStruct extends FileStructType<string | IFileStruct> { }

interface IProps {
    sourceData: SourceDataType | undefined
}

const SourceTreeView: FC<IProps> = ({ sourceData }) => {
    const classes = useStyles()

    const [files, setFiles] = useState<null | IFileStruct>(null)
    const [content, setContent] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [activeFile, setActiveFile] = useState('')


    useEffect(() => {
        if (sourceData) {
            setIsLoading(true)
            readZip(sourceData)
        }
    }, [sourceData])

    const readZip = (sourceData: SourceDataType) => {
        const jsZip = new JSZip()

        jsZip.loadAsync(sourceData.zipData, { base64: true }).then(async (data) => {
            const files = await readFilesAndCheckFolders(data.files)

            setActiveFile('Cargo.toml')
            setContent(files['Cargo.toml'] as string)
            setIsLoading(false)
            setFiles(files)
        })
    }

    const readFilesAndCheckFolders = (jsZipFiles: JSZipFilesType): Promise<IFileStruct> => {
        const files = [] as Array<{
            name: string
            content: string
            level: number
        }>
        const foldersNames = [] as Array<string>

        return new Promise(async (res, rej) => {

            for (const fName in jsZipFiles) {
                if (!jsZipFiles[fName].dir) { // File, not directory
                    const fContent = await jsZipFiles[fName].async('text')
                    files.push({
                        name: fName,
                        content: fContent,
                        level: fName.split('/').length - 1
                    })
                }
                else {
                    foldersNames.push(fName)
                }
            }

            const fileStruct = {} as IFileStruct

            const folders = [] as Array<{ name: string, level: number }>

            foldersNames.forEach(name => {
                folders.push({
                    name,
                    level: name.split('/').length - 2
                })
            })

            folders.sort((a, b) => (a.level > b.level) ? 1 : ((b.level > a.level) ? -1 : 0))

            folders.forEach(folder => {
                if (folder.level === 0) { // folder is in root directory of zip
                    fileStruct[folder.name] = {}
                }
                else {
                    let dirs = folder.name.split('/')

                    //remove empty string
                    dirs.pop()

                    //get exact name of folder and delete it from array
                    const name = dirs.pop()

                    let folderObject = fileStruct

                    dirs.forEach(d => {
                        folderObject = folderObject[d + '/'] as IFileStruct
                    })

                    folderObject[name + '/'] = {}
                }
            })

            files.forEach(file => {
                if (file.level === 0) {// file is in root directory of zip
                    fileStruct[file.name] = file.content
                }
                else {
                    const dirs = file.name.split('/')


                    //get file name and delete it from array
                    const name = dirs.pop() as string

                    let folderObject = fileStruct

                    dirs.forEach((d: any) => {
                        folderObject = folderObject[d + '/'] as IFileStruct
                    })

                    folderObject[name] = file.content
                }
            })

            res(fileStruct)
        })
    }

    const getJSXFromFiles = (files: IFileStruct, num = 1, fName?: string) => {

        const folderName = num === 1 ? `codeId${sourceData?.codeId}` : fName?.split('/')[0]

        return <StyledTreeItem nodeId={`${num}`} key={`${num}`} labelText={folderName} labelIcon={FolderOpenIcon}>
            {
                Object.keys(files).map((name, i) => {
                    // console.log(`${num}-${name}`)
                    // debugger
                    if (typeof files[name] === 'string') {

                        return <StyledTreeItem
                            labelText={name}
                            labelIcon={CodeIcon}
                            key={`${num}-${i}`}
                            nodeId={`${num}-${i}`}
                            color="#1a73e8"
                            bgColor="#e8f0fe"
                            onClick={() => {
                                setActiveFile(name)
                                setContent(files[name] as string)
                            }}
                        />
                    }
                    else {
                        // debugger
                        return getJSXFromFiles(files[name] as IFileStruct, ++num, name)
                    }
                })
            }
        </StyledTreeItem>


    }

    const onGithubClick = () => {
        window.open(sourceData?.githubLink, '_blank')?.focus()
    }

    const onDownloadClick = () => {
        const a = document.createElement("a")
        console.log(sourceData?.zipData)
        a.href = "data:application/zip;base64," + sourceData?.zipData
        a.download = `codeId${sourceData?.codeId}.zip`
        a.click()
    }

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', marginTop: 30, height: 650, overflowY: 'auto' }}>

                <TreeView
                    className={classes.root}

                    defaultExpanded={['1']}
                    defaultCollapseIcon={<ArrowDropDownIcon />}
                    defaultExpandIcon={<ArrowRightIcon />}
                    defaultEndIcon={<div style={{ width: 24 }} />}
                >
                    {files && getJSXFromFiles(files)}
                </TreeView>
                <Box style={{ width: '80%', marginLeft: 20 }}>
                    <Typography variant='h6'>{activeFile}</Typography>
                    <Box my={2} className={classes.fileContent} >
                        {content}
                    </Box>
                </Box>

            </div >
            <Box display='flex' gridColumnGap={10}>
                <Shift />

                {sourceData?.githubLink && <Button style={{ background: 'black' }} variant='contained' onClick={onGithubClick}>
                    <GitHub style={{ fill: 'white' }} />
                </Button>}
                <Button color="primary" variant='contained' onClick={onDownloadClick}>Download</Button>
            </Box>
            <Backdrop className={classes.backdrop} open={isLoading} >
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>
    )
}

export default SourceTreeView