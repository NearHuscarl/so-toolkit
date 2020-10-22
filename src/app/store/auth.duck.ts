import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import storage from "redux-persist/lib/storage"
import add from "date-fns/add"
import { PersistConfig, persistReducer } from "app/store/persist"
import { User } from "app/types"
import { OAUTH_DURATION } from "app/constants"

export interface AuthState {
  loading: boolean
  me?: User
  accessToken?: string
  expireDate?: string
}

export type AuthorizeResult = {
  user: User
  accessToken: string
}

export const initialState: AuthState = {
  loading: false,
}

const slice = createSlice({
  initialState,
  name: "auth",
  reducers: {
    authorizeRequest(state) {
      state.loading = true
    },
    authorizeSuccess(state, action: PayloadAction<AuthorizeResult>) {
      const { user, accessToken } = action.payload

      state.me = user
      state.accessToken = accessToken
      state.expireDate = add(Date.now(), OAUTH_DURATION).toISOString()
      state.loading = false
    },
    authorizeFailure(state) {
      state.loading = false
    },
    unauthorizeRequest(state) {
      state.loading = true
    },
    unauthorizeSuccess(state) {
      state.me = undefined
      state.accessToken = undefined
      state.expireDate = undefined
      state.loading = false
    },
    unauthorizeFailure(state) {
      state.loading = false
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
  blacklist: ["loading"],
}

export const { actions } = slice
export const reducer = persistReducer(persistConfig, slice.reducer)
