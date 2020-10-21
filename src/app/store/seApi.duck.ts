import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { PersistConfig, persistReducer } from "app/store/persist"
import storage from "redux-persist/lib/storage"

export interface State {
  quotaRemaining: number
}

const initialState: State = {
  quotaRemaining: 10_000,
}

const slice = createSlice({
  initialState,
  name: "seApi",
  reducers: {
    setQuotaRemaining(state, action: PayloadAction<number>) {
      state.quotaRemaining = action.payload
    },
  },
})

const persistConfig: PersistConfig<State> = {
  storage,
  key: "seApi",
}

export const { actions } = slice
export const reducer = persistReducer(persistConfig, slice.reducer)
