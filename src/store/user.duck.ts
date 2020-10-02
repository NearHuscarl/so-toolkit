import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { PersistConfig, persistReducer } from "./persist";
import { call, put, takeLatest } from "typed-redux-saga";
import { User } from "../types";
import { UserService } from "../helpers";

export interface AuthState {
  user?: User;
  userId?: number;
}

const initialState: AuthState = {
  user: undefined,
  userId: undefined,
};

const slice = createSlice({
  initialState,
  name: "user",
  reducers: {
    getUserRequest(state, action: PayloadAction<number>) {
      state.userId = action.payload;
    },
    getUserSuccess(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    getUserFailure(state) {
      state.userId = undefined;
    },
  },
});

const persistConfig: PersistConfig<AuthState> = {
  storage,
  key: "user",
};

export const { actions } = slice;
export const reducer = persistReducer(persistConfig, slice.reducer);

function* getUser(action: ReturnType<typeof actions.getUserRequest>) {
  try {
    const userId = action.payload;
    const response = yield* call(UserService.getUser, userId);
    yield* put(actions.getUserSuccess(response));
  } catch (e) {
    yield* put(actions.getUserFailure());
  }
}

export function* saga() {
  yield* takeLatest(actions.getUserRequest.type, getUser);
}
