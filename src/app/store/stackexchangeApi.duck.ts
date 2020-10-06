import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface State {
  quotaRemaining?: number;
}

const initialState: State = {
  quotaRemaining: undefined,
};

const slice = createSlice({
  initialState,
  name: "stackexchangeApi",
  reducers: {
    setQuotaRemaining(state, action: PayloadAction<number>) {
      state.quotaRemaining = action.payload;
    },
  },
});

export const { actions, reducer } = slice;
