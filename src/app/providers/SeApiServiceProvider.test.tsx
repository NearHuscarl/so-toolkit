import React from "react"
import { Provider } from "react-redux"
import { render } from "@testing-library/react"
import {
  createMockedStore,
  createMockedUserService,
  toThrowSilently,
} from "app/test"
import SeApiServiceProvider from "./SeApiServiceProvider"
import { useSeApi } from "app/hooks"
import { AxiosProvider } from "app/providers"

describe("<SeApiServiceProvider />", () => {
  it("should throw if not wrapped inside <Provider/> and <AxiosProvider/>", () => {
    const app = () => render(<SeApiServiceProvider />)
    toThrowSilently(app, "could not find react-redux context value;")

    const store = createMockedStore()
    const app1 = () =>
      render(
        <Provider store={store}>
          <AxiosProvider>
            <SeApiServiceProvider />
          </AxiosProvider>
        </Provider>
      )
    expect(app1).not.toThrow()
  })

  it("should provide the API to children", () => {
    const store = createMockedStore()
    const { userService } = createMockedUserService()

    function Test() {
      const api = useSeApi()
      expect(api.userService).toBe(userService)
      return <span data-testid="me">abc</span>
    }

    render(
      <Provider store={store}>
        <AxiosProvider>
          <SeApiServiceProvider service={{ userService }}>
            <Test />
          </SeApiServiceProvider>
        </AxiosProvider>
      </Provider>
    )
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
          <AxiosProvider>
            <SeApiServiceProvider>
              <Test />
            </SeApiServiceProvider>
          </AxiosProvider>
        </Provider>
      )
    expect(app1).not.toThrow()
  })

  it("service should use the new AxiosInstance if it's updated in <AxiosProvider/>", () => {
    // TODO
  })
})
