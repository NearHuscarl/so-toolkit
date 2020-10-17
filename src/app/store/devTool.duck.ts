import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import storage from "redux-persist/lib/storage"
import { PersistConfig, persistReducer } from "app/store/persist"

export interface DevToolState {
  useMockedApi: boolean
}

export const initialState: DevToolState = {
  useMockedApi: false,
}

const slice = createSlice({
  initialState,
  name: "user",
  reducers: {
    useMockedApi(state, action: PayloadAction<boolean>) {
      state.useMockedApi = action.payload
    },
  },
})

const persistConfig: PersistConfig<DevToolState> = {
  storage,
  key: "devTool",
}

export const { actions } = slice
export const reducer = persistReducer(persistConfig, slice.reducer)
