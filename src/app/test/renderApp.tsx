import { render, RenderOptions } from "@testing-library/react"
import React from "react"
import {
  SeApiServiceProvider,
  SnackbarProvider,
  ThemeProvider,
} from "app/providers"
import { Provider } from "react-redux"
import { createMockedUserService } from "app/test/index"

type AllRenderOptions = Omit<RenderOptions, "queries">

export default function renderApp(
  ui: React.ReactElement,
  options: AllRenderOptions = {}
) {
  const { userService, store, api } = createMockedUserService()
  const renderResult = render(
    <Provider store={store}>
      <ThemeProvider>
        <SeApiServiceProvider service={{ userService }}>
          <SnackbarProvider>{ui}</SnackbarProvider>
        </SeApiServiceProvider>
      </ThemeProvider>
    </Provider>,
    options
  )

  return {
    renderResult,
    context: {
      store,
      api,
    },
  }
}
