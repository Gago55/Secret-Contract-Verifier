import { Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { CodeType, fetchCodeByContractAddress, fetchCodes, verifyAttempt, VerifyAttemptType, fetchVerifyAttempt } from './../api/appAPI';
import { InferActionsType, StateType } from './store';

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
    actualVerifyAttempt: undefined as undefined | VerifyAttemptType
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
}

export type ActionsType = InferActionsType<typeof actions>

type ThunkType = ThunkAction<Promise<void>, StateType, unknown, ActionsType>
type DispatchType = Dispatch<ActionsType>

//Thunks
export const getCodes = (): ThunkType => async (dispatch: DispatchType) => {
    try {
        const codes = await fetchCodes()
        dispatch(actions.setCodes(codes))
    } catch (error) {

    }
}

export const getCodeByContractAddress = (address: string): ThunkType => async (dispatch: DispatchType, getState: () => StateType) => {

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
        } catch (error) {

        }
    }
}

export const verify = (codeId: number, zipData: FormData): ThunkType => async (dispatch: DispatchType) => {
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

export const getVerifyAttempt = (id: string): ThunkType => async (dispatch: DispatchType) => {
    try {
        const attempt = await fetchVerifyAttempt(id)

        dispatch(actions.setActualVerifyAttempt(attempt))
    } catch (error) {
    }
}

export default appReducer