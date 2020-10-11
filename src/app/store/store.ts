import {
  configureStore,
  EnhancedStore,
  getDefaultMiddleware,
} from "@reduxjs/toolkit"
import createSagaMiddleware, { SagaMiddleware } from "redux-saga"
import {
  persistStore,
  REGISTER,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
} from "redux-persist"
import { Middleware } from "redux"
import { rootSaga, reducer } from "./rootDuck"
import { __DEV__ } from "app/constants"
import createLoggerMiddleware from "./createLoggerMiddleware"

function createMiddlewares() {
  let middlewares: Middleware[] = []

  if (__DEV__) {
    const logger = createLoggerMiddleware()
    if (logger) middlewares.push(logger)
  }

  const sagaMiddleware = createSagaMiddleware()
  const rtkMiddlewares = getDefaultMiddleware({
    thunk: false,
    serializableCheck: {
      // FIX: serialization issue when using redux-toolkit with redux-persist
      // https://github.com/reduxjs/redux-toolkit/issues/121#issuecomment-611641781
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  })

  middlewares = middlewares.concat(rtkMiddlewares)
  middlewares.push(sagaMiddleware)

  return middlewares
}

function isSagaMiddleware(
  middleware: Middleware
): middleware is SagaMiddleware {
  return middleware.name === "sagaMiddleware"
}

function createStore() {
  const middlewares = createMiddlewares()
  const store = configureStore({
    reducer,
    middleware: middlewares,
  })

  middlewares.forEach((m) => {
    if (isSagaMiddleware(m)) {
      m.run(rootSaga)
    }
  })

  return store
}

const store = createStore()

export type RootState = ReturnType<typeof store.getState>
export type AppStore = EnhancedStore<RootState>

export const persistor = persistStore(store)
export default store
