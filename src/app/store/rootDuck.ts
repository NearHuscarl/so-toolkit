import { all } from "redux-saga/effects"
import * as auth from "./auth.duck"
import * as user from "./user.duck"
import * as seApi from "./stackexchangeApi.duck"
import * as devTool from "./devTool.duck"

export const userInitialState = user.initialState
export const userActions = user.actions

export const authActions = auth.actions
export const seApiActions = seApi.actions
export const devToolActions = devTool.actions

export const reducer = {
  auth: auth.reducer,
  user: user.reducer,
  seApi: seApi.reducer,
  devTool: devTool.reducer,
}

export function* rootSaga() {
  yield all([user.saga()])
}
