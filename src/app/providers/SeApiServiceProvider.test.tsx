import React from "react"
import { Provider } from "react-redux"
import { render } from "@testing-library/react"
import { createMockedStore, toThrowSilently } from "app/test"
import { SeApiServiceProvider } from "./SeApiServiceProvider"
import { useSeApi } from "app/hooks"
import { AxiosProvider } from "app/providers"
import { AuthService, PplReachedService, UserService } from "app/services"
import { createSeApi } from "app/helpers"

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
    const api = () => createSeApi(store)
    const props = { api, store }
    const userService = new UserService(props)
    const authService = new AuthService(props)
    const pplReachedService = new PplReachedService(props)

    function Test() {
      const api = useSeApi()
      expect(api.userService).toBe(userService)
      expect(api.pplReachedService).toBe(pplReachedService)
      expect(api.authService).toBe(authService)
      return <span data-testid="me">abc</span>
    }

    render(
      <Provider store={store}>
        <AxiosProvider>
          <SeApiServiceProvider
            service={{ userService, pplReachedService, authService }}
          >
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
