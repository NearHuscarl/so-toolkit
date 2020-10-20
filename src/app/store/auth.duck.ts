import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import storage from "redux-persist/lib/storage"
import add from "date-fns/add"
import { PersistConfig, persistReducer } from "app/store/persist"
import { User } from "app/types"

export interface AuthState {
  me?: User
  accessToken?: string
  expireDate?: string
}

export type AuthorizeResult = {
  user: User
  accessToken: string
}

export const initialState: AuthState = {}

const slice = createSlice({
  initialState,
  name: "auth",
  reducers: {
    authorize(state, action: PayloadAction<AuthorizeResult>) {
      const { user, accessToken } = action.payload

      state.me = user
      state.accessToken = accessToken
      state.expireDate = add(Date.now(), { days: 14 }).toISOString()
    },
    unauthorize(state) {
      state.me = undefined
      state.accessToken = undefined
      state.expireDate = undefined
    },
  },
})

const persistConfig: PersistConfig<AuthState> = {
  storage,
  key: "auth",
}

export const { actions } = slice
export const reducer = persistReducer(persistConfig, slice.reducer)
