import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import storage from "redux-persist/lib/storage"
import { PersistConfig, persistReducer } from "app/store/persist"

export interface DevToolState {
  enableMsw: boolean
}

export const initialState: DevToolState = {
  enableMsw: false,
}

const slice = createSlice({
  initialState,
  name: "user",
  reducers: {
    enableMsw(state, action: PayloadAction<boolean>) {
      state.enableMsw = action.payload
    },
  },
})

const persistConfig: PersistConfig<DevToolState> = {
  storage,
  key: "devTool",
}

export const { actions } = slice
export const reducer = persistReducer(persistConfig, slice.reducer)
