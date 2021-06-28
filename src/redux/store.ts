import { createStore, combineReducers, applyMiddleware, compose } from "redux"
import thunkMiddleware, { ThunkMiddleware } from 'redux-thunk'
import appReducer, { ActionsType } from "./appReducer"

const rootReducer = combineReducers({
    appReducer
})

export type StateType = ReturnType<typeof rootReducer>
export type InferActionsType<T> = T extends { [keys: string]: (...args: any[]) => infer U } ? U : never

// @ts-ignore
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(rootReducer, composeEnhancers(
    applyMiddleware(thunkMiddleware as ThunkMiddleware<StateType, ActionsType>)
))

export default store