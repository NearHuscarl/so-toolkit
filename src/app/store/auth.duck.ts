import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import storage from "redux-persist/lib/storage"
import add from "date-fns/add"
import { PersistConfig, persistReducer } from "app/store/persist"
import { User } from "app/types"
import { OAUTH_DURATION } from "app/constants"

export interface AuthState {
  me?: User
  accessToken?: string
  // I have no choice: https://meta.stackexchange.com/a/341993/860277
  authCookie?: string
  expireDate?: string
}

export type AuthResult = {
  user: User
  authCookie: string
  accessToken: string
}

export const initialState: AuthState = {}

const slice = createSlice({
  initialState,
  name: "auth",
  reducers: {
    authorizeSuccess(state, action: PayloadAction<AuthResult>) {
      const { user, accessToken, authCookie } = action.payload

      state.me = user
      state.accessToken = accessToken
      state.authCookie = ".ASPXAUTH=" + authCookie
      state.expireDate = add(Date.now(), OAUTH_DURATION).toISOString()
    },
    unauthorizeSuccess(state) {
      state.me = undefined
      state.accessToken = undefined
      state.expireDate = undefined
      // state.authCookie = undefined
    },
    // for debugging
    _setExpireDate(state, action: PayloadAction<string>) {
      state.expireDate = action.payload
    },
  },
})

const persistConfig: PersistConfig<AuthState> = {
  storage,
  key: "auth",
}

export const { actions } = slice
export const reducer = persistReducer(persistConfig, slice.reducer)
