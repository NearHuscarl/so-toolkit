import { render, RenderOptions } from "@testing-library/react"
import React from "react"
import {
  SeApiServiceProvider,
  SnackbarProvider,
  ThemeProvider,
} from "app/providers"
import { Provider } from "react-redux"
import { createMockedUserService } from "app/test/index"

export type MockOptions = {
  apiResponseDelay?: number
}
type AllRenderOptions = MockOptions & Omit<RenderOptions, "queries">

export default function renderApp(
  ui: React.ReactElement,
  options: AllRenderOptions = {}
) {
  const { apiResponseDelay = 0, ...opts } = options
  const { userService, store, api } = createMockedUserService({
    apiResponseDelay,
  })
  const App = (comp) => (
    <Provider store={store}>
      <ThemeProvider>
        <SeApiServiceProvider service={{ userService }}>
          <SnackbarProvider>{comp}</SnackbarProvider>
        </SeApiServiceProvider>
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
