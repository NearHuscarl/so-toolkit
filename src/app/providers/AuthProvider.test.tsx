import React from "react"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { createMockedStore, Roles, user } from "app/test"
import { useAuth } from "app/hooks"
import {
  AuthProvider,
  AxiosProvider,
  SeApiServiceProvider,
} from "app/providers"
import { getApi } from "app/test/api"
import { mockAccessToken, users } from "app/test/fixtures"
import * as oauth from "app/helpers/oauth"
import { act } from "react-dom/test-utils"
import { authActions, seApiActions } from "app/store"

describe("<AuthProvider />", () => {
  function renderUI(ui: React.ReactElement, store = createMockedStore()) {
    const api = getApi(store)
    const App = (ui) => (
      <Provider store={store}>
        <AxiosProvider api={api}>
          <SeApiServiceProvider>{ui}</SeApiServiceProvider>
        </AxiosProvider>
      </Provider>
    )

    const renderResult = render(App(ui))
    const rerender = (newUi: React.ReactElement) => {
      renderResult.rerender(App(newUi))
    }

    return {
      renderResult,
      rerender,
      store,
      api,
    }
  }

  function mockOauth(accessToken: string) {
    jest.spyOn(oauth, "_authenticate").mockResolvedValue({
      accessToken,
      expireDate: new Date(),
    })
  }

  it("should provide auth helpers via useAuth if components are children of <AuthProvider/>", () => {
    function Test() {
      const auth = useAuth()
      expect(auth).toMatchObject({
        isTokenValid: expect.any(Function),
        authorize: expect.any(Function),
        unauthorize: expect.any(Function),
        isLogin: expect.any(Function),
      })
      return <span>abc</span>
    }

    renderUI(
      <AuthProvider>
        <Test />
      </AuthProvider>
    )
  })

  it("should complete if login with a valid access token", async () => {
    mockOauth(mockAccessToken)

    function Test() {
      const { authorize } = useAuth()
      const onClick = async () => {
        const result = await authorize()
        expect(result).toMatchObject({
          accessToken: mockAccessToken,
          user: {
            display_name: "NearHuscarl",
          },
        })
      }

      return <button onClick={onClick}>click</button>
    }

    renderUI(
      <AuthProvider>
        <Test />
      </AuthProvider>
    )

    const button = screen.getByRole(Roles.button)
    await user.click(button)
  })

  it("should throw if login with an invalid access token", async () => {
    mockOauth("invalid_access_token")

    function Test() {
      const { authorize } = useAuth()
      const onClick = async () => {
        await expect(authorize()).rejects.toThrow(
          "token not found (does not exist)."
        )
      }

      return <button onClick={onClick}>click</button>
    }

    renderUI(
      <AuthProvider>
        <Test />
      </AuthProvider>
    )

    const button = screen.getByRole(Roles.button)
    await user.click(button)
  })

  it("should implicitly logout if access token is expired", async () => {
    jest.useFakeTimers("modern")

    const store = createMockedStore({
      auth: {
        accessToken: mockAccessToken,
        me: users.find((u) => u.display_name === "NearHuscarl"),
        expireDate: new Date(Date.now() - 1000).toISOString(),
      },
    })

    const { api } = renderUI(
      <AuthProvider>
        <div />
      </AuthProvider>,
      store
    )
    await act(async () => {
      jest.advanceTimersByTime(1)
    })

    const actions = store.getActions()

    expect(api.history.get[0].url).toBe(
      `access-tokens/${mockAccessToken}/invalidate`
    )
    expect(api.defaults.params.access_token).toBeUndefined()
    expect(actions[0]).toStrictEqual(seApiActions.setQuotaRemaining(9977))
    expect(actions[1]).toStrictEqual(authActions.unauthorize())
  })

  it("should invalidate current access token before requesting a new one", async () => {
    jest.useFakeTimers("modern")
    mockOauth(mockAccessToken)

    const store = createMockedStore({
      auth: {
        accessToken: mockAccessToken,
        expireDate: new Date(Date.now() + 1000).toISOString(),
      },
    })

    function Test() {
      const { authorize } = useAuth()
      const onClick = async () => {
        await authorize()
      }

      return <button onClick={onClick}>click</button>
    }

    const { api } = renderUI(
      <AuthProvider>
        <Test />
      </AuthProvider>,
      store
    )

    const button = screen.getByRole(Roles.button)
    await user.click(button)
    await act(async () => {
      jest.advanceTimersByTime(1)
    })

    expect(api.history.get).toHaveLength(2)
    expect(api.history.get[0].url).toBe(
      `access-tokens/${mockAccessToken}/invalidate`
    )
    expect(api.history.get[1].url).toBe("me")
  })
})
