import configureStore from "redux-mock-store"
import merge from "lodash/merge"
import { RootState, userInitialState } from "app/store"

type RemovePersist<StoreState> = {
  [P in keyof StoreState]: Omit<StoreState[P], "_persist">
}
type MockState = RemovePersist<RootState>
export type InitialMockState = Partial<MockState>
export type MockedStore = ReturnType<typeof createMockedStore>

export function createMockedStore(state: InitialMockState = {}) {
  const mockStore = configureStore<RootState>()
  const initialState: MockState = {
    user: userInitialState,
    seApi: {
      quotaRemaining: 0,
    },
    devTool: {
      useMockedApi: true,
    },
    auth: {},
  }

  return mockStore(merge(initialState as any, state))
}
