import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { PersistConfig, persistReducer } from "app/store/persist";
import { call, put, takeLatest } from "typed-redux-saga";
import { User } from "app/types";
import { UserService } from "app/helpers";
import { Entry } from "lru-cache";

export interface UserState {
  user?: User;
  userId?: number;
  cache: Entry<number, User>[];
  userSearchCache: Entry<string, number[]>[];
}

const initialState: UserState = {
  user: undefined,
  userId: undefined,
  cache: [],
  userSearchCache: [],
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
    setUserCache(state, action: PayloadAction<Entry<number, User>[]>) {
      state.cache = action.payload;
    },
    setUserSearchCache(
      state,
      action: PayloadAction<Entry<string, number[]>[]>
    ) {
      state.userSearchCache = action.payload;
    },
  },
});

const persistConfig: PersistConfig<UserState> = {
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
    console.log(e.response.data); // TODO: add error snackbar
    yield* put(actions.getUserFailure());
  }
}

export function* saga() {
  yield* takeLatest(actions.getUserRequest.type, getUser);
}
