import { Dispatch } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { CodeType, fetchCodeByContractAddress, fetchCodes, fetchSourceData, fetchVerifyAttempt, fetchVerifyAttempts, fetchVerifyAttemptsByCodeId, SourceDataType, verifyAttempt, VerifyAttemptType } from './../api/appAPI'
import { InferActionsType, StateType } from './store'

export type VerifyResponseType = {
    status: number
    verifyAttemptId: string
    onProgressAttemptId: string
}

const initState = {
    codes: [] as Array<CodeType>,
    actualCode: undefined as undefined | CodeType,
    verifyResponse: {
        status: 0,
        verifyAttemptId: '',
        onProgressAttemptId: ''
    } as VerifyResponseType,
    verifyResponseError: '',
    actualVerifyAttempt: undefined as undefined | VerifyAttemptType,
    actualSourceData: undefined as undefined | SourceDataType,
    verifyAttempts: [] as Array<VerifyAttemptType>,
    actualCodeVerifyAttempts: [] as Array<VerifyAttemptType>,
    getContractError: ''
}

type InitStateType = typeof initState

const appReducer = (state = initState, action: ActionsType): InitStateType => {
    switch (action.type) {
        case 'sc/app/SET_CODES':
            return {
                ...state,
                codes: [...action.arr]
            }
        case 'sc/app/SET_ACTUAL_CODE':
            return {
                ...state,
                actualCode: action.code
            }
        case 'sc/app/SET_ACTUAL_CODE_BY_ID':
            return {
                ...state,
                actualCode: state.codes.find(code => code.id == action.codeId)
            }
        case 'sc/app/SET_VERIFY_RESPONSE':
            return {
                ...state,
                verifyResponse: {
                    status: action.status,
                    verifyAttemptId: action.id,
                    onProgressAttemptId: action.onProgressId
                }
            }
        case 'sc/app/SET_VERIFY_RESPONSE_ERROR':
            return {
                ...state,
                verifyResponseError: action.msg
            }
        case 'sc/app/SET_ACTUAL_VERIFY_ATTEMPT':
            return {
                ...state,
                actualVerifyAttempt: action.attempt
            }
        case 'sc/app/SET_ACTUAL_SOURCE_DATA':
            return {
                ...state,
                actualSourceData: action.data
            }
        case 'sc/app/SET_VERIFY_ATTEMPTS': {
            return {
                ...state,
                verifyAttempts: action.arr
            }
        }
        case 'sc/app/SET_ACTUAL_CODE_VERIFY_ATTEMPTS': {
            return {
                ...state,
                actualCodeVerifyAttempts: action.arr
            }
        }
        case 'sc/app/SET_GET_CONTRACT_ERROR': {
            return {
                ...state,
                getContractError: action.msg
            }
        }
        default:
            return state
    }
}

export const actions = {
    setCodes: (arr: Array<CodeType>) => ({ type: 'sc/app/SET_CODES', arr } as const),
    setActualCode: (code: CodeType) => ({ type: 'sc/app/SET_ACTUAL_CODE', code } as const),
    setActualCodeById: (codeId: number) => ({ type: 'sc/app/SET_ACTUAL_CODE_BY_ID', codeId } as const),
    setVerifyResponse: (status: number, id: string, onProgressId: string) => ({ type: 'sc/app/SET_VERIFY_RESPONSE', status, id, onProgressId } as const),
    setVerifyResponseError: (msg: string) => ({ type: 'sc/app/SET_VERIFY_RESPONSE_ERROR', msg } as const),
    setActualVerifyAttempt: (attempt: VerifyAttemptType) => ({ type: 'sc/app/SET_ACTUAL_VERIFY_ATTEMPT', attempt } as const),
    setActualSourceData: (data: SourceDataType) => ({ type: 'sc/app/SET_ACTUAL_SOURCE_DATA', data } as const),
    setVerifyAttempts: (arr: Array<VerifyAttemptType>) => ({ type: 'sc/app/SET_VERIFY_ATTEMPTS', arr } as const),
    setActualCodeVerifyAttempts: (arr: Array<VerifyAttemptType>) => ({ type: 'sc/app/SET_ACTUAL_CODE_VERIFY_ATTEMPTS', arr } as const),
    setGetContractError: (msg: string) => ({ type: 'sc/app/SET_GET_CONTRACT_ERROR', msg } as const),
}

export type ActionsType = InferActionsType<typeof actions>

type ThunkType = ThunkAction<Promise<void>, StateType, unknown, ActionsType>

//Thunks
export const getCodes = (): ThunkType => async (dispatch) => {
    try {
        const codes = await fetchCodes()
        dispatch(actions.setCodes(codes))
    } catch (error) {

    }
}

export const getCodeByContractAddress = (address: string): ThunkType => async (dispatch, getState: () => StateType) => {

    const codes = getState().appReducer.codes

    let codeId = null as null | number

    for (const code of codes) {
        code.contracts.forEach(c => {
            if (c.address === address)
                codeId = code.id
        })
    }

    if (codeId !== null) {
        dispatch(actions.setActualCodeById(codeId))
    }
    else {
        try {
            const code = await fetchCodeByContractAddress(address)
            dispatch(actions.setActualCode(code))
            // dispatch(getVerifyAttemptsByCodeId(code.id))
        } catch (error) {
            if (error.response?.status === 402)
                dispatch(actions.setGetContractError(error.response?.data.message))
            else
                dispatch(actions.setGetContractError('Something went wrong'))
        }
    }
}

export const verify = (codeId: number, zipData: FormData): ThunkType => async (dispatch) => {
    try {
        const verifyResponse = await verifyAttempt(codeId, zipData)
        console.log(verifyResponse)

        dispatch(actions.setVerifyResponse(
            verifyResponse.status,
            verifyResponse.data.verifyAttemptId ? verifyResponse.data.verifyAttemptId : '',
            verifyResponse.data.onProgressAttemptId ? verifyResponse.data.onProgressAttemptId : ''
        ))
    } catch (error) {
        if (error.response)
            dispatch(actions.setVerifyResponseError(error.response.data.message))
        else
            dispatch(actions.setVerifyResponseError(error.message))
    }
}

export const getVerifyAttempt = (id: string): ThunkType => async (dispatch) => {
    try {
        const attempt = await fetchVerifyAttempt(id)

        dispatch(actions.setActualVerifyAttempt(attempt))
    } catch (error) {
    }
}

export const getVerifyAttempts = (): ThunkType => async (dispatch) => {
    try {
        const data = await fetchVerifyAttempts()

        dispatch(actions.setVerifyAttempts(data))
    } catch (error) {
    }
}

export const getVerifyAttemptsByCodeId = (codeId: number): ThunkType => async (dispatch) => {
    try {
        const data = await fetchVerifyAttemptsByCodeId(codeId)

        dispatch(actions.setActualCodeVerifyAttempts(data))
    } catch (error) {
    }
}

export const getSourceData = (codeId: number | string): ThunkType => async (dispatch) => {
    try {
        const data = await fetchSourceData(codeId)

        dispatch(actions.setActualSourceData(data))
    } catch (error) {
    }
}

export default appReducer