import { all } from "redux-saga/effects";
import * as user from "./user.duck";
import * as seApi from "./stackexchangeApi.duck";

export const userActions = user.actions;
export const seApiActions = seApi.actions;

export const reducer = {
  user: user.reducer,
  seApi: seApi.reducer,
};

export function* rootSaga() {
  yield all([user.saga()]);
}
