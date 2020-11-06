import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import storage from "redux-persist/lib/storage"
import { PersistConfig, persistReducer } from "app/store/persist"

type ImpactPageTab = "1" | "2"

export interface ImpactPageState {
  currentTab: ImpactPageTab
}

export const initialState: ImpactPageState = { currentTab: "1" }

const slice = createSlice({
  initialState,
  name: "impact",
  reducers: {
    setCurrentTab(state, action: PayloadAction<ImpactPageTab>) {
      state.currentTab = action.payload
    },
  },
})

const persistConfig: PersistConfig<ImpactPageState> = {
  storage,
  key: "impact",
}

export const { actions } = slice
export const reducer = persistReducer(persistConfig, slice.reducer)
