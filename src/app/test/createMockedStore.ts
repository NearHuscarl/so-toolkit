import configureStore from "redux-mock-store"
import { RootState, userInitialState } from "app/store"

export default function createMockedStore() {
  const mockStore = configureStore<RootState>()
  return mockStore({
    user: userInitialState as any,
    seApi: {
      quotaRemaining: 0,
    },
  })
}
