import { render, RenderOptions } from "@testing-library/react"
import React from "react"
import {
  SeApiServiceProvider,
  SnackbarProvider,
  ThemeProvider,
} from "app/providers"
import { Provider } from "react-redux"
import { createMockedUserService } from "app/test/index"

export type AppRenderOptions = {
  apiResponseDelay?: number
}
type AllRenderOptions = AppRenderOptions & Omit<RenderOptions, "queries">

export default function renderApp(
  ui: React.ReactElement,
  options: AllRenderOptions = {}
) {
  const { apiResponseDelay = 0, ...opts } = options
  const { userService, store, api } = createMockedUserService({
    apiResponseDelay,
  })
  const renderResult = render(
    <Provider store={store}>
      <ThemeProvider>
        <SeApiServiceProvider service={{ userService }}>
          <SnackbarProvider>{ui}</SnackbarProvider>
        </SeApiServiceProvider>
      </ThemeProvider>
    </Provider>,
    opts
  )

  return {
    renderResult,
    context: {
      store,
      api,
    },
  }
}
