import { Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { CodeType, fetchCodeByContractAddress, fetchCodes, verifyAttempt } from './../api/appAPI';
import { InferActionsType, StateType } from './store';

const initState = {
    codes: [] as Array<CodeType>,
    actualCode: undefined as undefined | CodeType
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
        default:
            return state
    }
}

export const actions = {
    setCodes: (arr: Array<CodeType>) => ({ type: 'sc/app/SET_CODES', arr } as const),
    setActualCode: (code: CodeType) => ({ type: 'sc/app/SET_ACTUAL_CODE', code } as const),
    setActualCodeById: (codeId: number) => ({ type: 'sc/app/SET_ACTUAL_CODE_BY_ID', codeId } as const)
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
        await verifyAttempt(codeId, zipData)
    } catch (error) {

    }
}

export default appReducer