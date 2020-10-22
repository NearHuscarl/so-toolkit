import { render, RenderOptions } from "@testing-library/react"
import React from "react"
import {
  AxiosProvider,
  SeApiServiceProvider,
  SnackbarProvider,
  ThemeProvider,
} from "app/providers"
import { Provider } from "react-redux"
import { createMockedStore } from "app/test/index"
import { getApi } from "app/test/api"

export type MockOptions = {
  apiResponseDelay?: number
}
type AllRenderOptions = MockOptions & Omit<RenderOptions, "queries">

// TODO: create a lightweight renderMui() to test mui components only

export function renderApp(
  ui: React.ReactElement,
  options: AllRenderOptions = {}
) {
  const { apiResponseDelay = 0, ...opts } = options
  const store = createMockedStore()
  const api = getApi(store, { apiResponseDelay })

  const App = (comp) => (
    <Provider store={store}>
      <ThemeProvider>
        <AxiosProvider api={api}>
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
      api,
    },
  }
}
