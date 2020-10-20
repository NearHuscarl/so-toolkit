import configureStore from "redux-mock-store"
import { RootState, userInitialState } from "app/store"

type MockStoreState<StoreState> = {
  [P in keyof StoreState]: Omit<StoreState[P], "_persist">
}

export type MockedStore = ReturnType<typeof createMockedStore>

export default function createMockedStore() {
  const mockStore = configureStore<RootState>()
  const initialState: MockStoreState<RootState> = {
    user: userInitialState,
    seApi: {
      quotaRemaining: 0,
    },
    devTool: {
      useMockedApi: true,
    },
    auth: {},
  }

  return mockStore(initialState as any)
}
