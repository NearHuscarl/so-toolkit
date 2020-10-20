import React from "react"
import { render, screen } from "@testing-library/react"
import { createMockedStore, toThrowSilently } from "app/test"
import SeApiServiceProvider from "./SeApiServiceProvider"
import { useSeApi } from "app/hooks"
import { Provider } from "react-redux"

describe("<SeApiServiceProvider />", () => {
  it("should throw if not wrapped inside redux <Provider/>", () => {
    const app = () => render(<SeApiServiceProvider />)
    toThrowSilently(app, "could not find react-redux context value;")

    const store = createMockedStore()
    const app1 = () =>
      render(
        <Provider store={store}>
          <SeApiServiceProvider />
        </Provider>
      )
    expect(app1).not.toThrow()
  })

  it("should provide the API to children", () => {
    function Test() {
      const api = useSeApi()
      return <span data-testid="me">{api}</span>
    }
    const store = createMockedStore()

    render(
      <Provider store={store}>
        <SeApiServiceProvider service={"myApi" as any}>
          <Test />
        </SeApiServiceProvider>
      </Provider>
    )

    expect(screen.getByTestId("me")).toHaveTextContent("myApi")
  })

  it("should throw if children who use useSeApi() and is not wrapped inside <SeApiServiceProvider />", () => {
    function Test() {
      const api = useSeApi()
      return <>{api.toString()}</>
    }
    const app = () => render(<Test />)
    toThrowSilently(app, "could not find SE API service context value;")

    const store = createMockedStore()
    const app1 = () =>
      render(
        <Provider store={store}>
          <SeApiServiceProvider>
            <Test />
          </SeApiServiceProvider>
        </Provider>
      )
    expect(app1).not.toThrow()
  })

  it("service should use the new AxiosInstance if it's updated in <AxiosProvider/>", () => {
    // TODO
  })
})
