import { InferActionsType } from './store';

const initState = {
}

type InitStateType = typeof initState

const threeReducer = (state = initState, action: ActionsType): InitStateType => {
    // switch (action.type) {
    //     default:
    return state
    // }
}

export const actions = {

}

export type ActionsType = InferActionsType<typeof actions>

export default threeReducer