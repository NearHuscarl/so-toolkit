import { render, RenderOptions } from "@testing-library/react"
import React from "react"
import {
  AxiosProvider,
  SeApiServiceProvider,
  SnackbarProvider,
  ThemeProvider,
} from "app/providers"
import { Provider } from "react-redux"
import { createMockedStore, InitialMockState } from "app/test/index"
import { createMockApi } from "app/test/api"
import { createSeApi, createSedeApi } from "app/helpers"

export type MockOptions = {
  apiResponseDelay?: number
  initialState?: InitialMockState
}
type AllRenderOptions = MockOptions & Omit<RenderOptions, "queries">

export function renderApp(
  ui: React.ReactElement,
  options: AllRenderOptions = {}
) {
  const { apiResponseDelay = 0, initialState, ...opts } = options
  const store = createMockedStore(initialState)
  const seApi = createMockApi(createSeApi(store), { apiResponseDelay })
  const sedeApi = createMockApi(createSedeApi(store), { apiResponseDelay })

  const App = (comp) => (
    <Provider store={store}>
      <ThemeProvider>
        <AxiosProvider se={seApi} sede={sedeApi}>
          <SeApiServiceProvider>
            <SnackbarProvider>{comp}</SnackbarProvider>
          </SeApiServiceProvider>
        </AxiosProvider>
      </ThemeProvider>
    </Provider>
  )

  const renderResult = render(App(ui), opts)
  const rerender = (newUi: React.ReactElement) => {
    renderResult.rerender(App(newUi))
  }

  return {
    renderResult,
    rerender,
    context: {
      store,
      seApi,
      sedeApi,
    },
  }
}

export function renderMui(ui: React.ReactElement, options: RenderOptions = {}) {
  const App = (comp) => <ThemeProvider>{comp}</ThemeProvider>
  const renderResult = render(App(ui), options)
  const rerender = (newUi: React.ReactElement) => {
    renderResult.rerender(App(newUi))
  }

  return { renderResult, rerender }
}
