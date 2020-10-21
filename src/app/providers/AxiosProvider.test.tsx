import React from "react"
import { createMockedStore, Roles, user } from "app/test"
import { useAxios } from "app/hooks"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { AxiosProvider } from "app/providers/AxiosProvider"
import { mockAccessToken } from "app/test/fixtures"
import { getApi } from "app/test/api"

describe("<AxiosProvider />", () => {
  it("should provide the API to children", () => {
    const store = createMockedStore()

    function Test() {
      const api = useAxios()
      expect(api).toBeAxiosInstance()
      return <div />
    }

    render(
      <Provider store={store}>
        <AxiosProvider>
          <Test />
        </AxiosProvider>
      </Provider>
    )
  })

  it("should add access_token to default params if user's already logged in", () => {
    const store = createMockedStore({
      auth: {
        accessToken: mockAccessToken,
      },
    })
    const api = getApi()

    expect(api.defaults.params.access_token).toBeUndefined()

    function Test() {
      const api = useAxios()
      const onClick = () => {
        expect(api.defaults.params.access_token).toBe(mockAccessToken)
      }
      return <button onClick={onClick}>click</button>
    }

    render(
      <Provider store={store}>
        <AxiosProvider api={api}>
          <Test />
        </AxiosProvider>
      </Provider>
    )

    const button = screen.getByRole(Roles.button)
    user.click(button)
  })
})
