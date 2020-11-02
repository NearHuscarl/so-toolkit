import React, { PropsWithChildren, useCallback } from "react"
import { authActions, useDispatch, useStore } from "app/store"
import { useAxios, useSeApi, useTry } from "app/hooks"
import { User } from "app/types"
import { accessTokenErrorIds } from "app/helpers"
import { AuthResult } from "app/store/auth.duck"

type AuthorizeResult = {
  user: User
  accessToken: string
}
type Context = {
  accessToken?: string
  isTokenValid: () => Promise<boolean>
  isLogin: () => boolean
  authorize: () => Promise<AuthorizeResult>
  unauthorize: () => Promise<void>
  login: (loginData: AuthResult) => void
}

export const EMPTY_AUTH_CONTEXT = Object.freeze({} as any)
export const AuthContext = React.createContext<Context>(EMPTY_AUTH_CONTEXT)

function useAuthContext(): Context {
  const dispatch = useDispatch()
  const { userService, authService } = useSeApi()
  const store = useStore()
  const axios = useAxios()
  const isLogin = useCallback(
    () => Boolean(store.getState().auth.accessToken),
    [store]
  )

  const unauthorize = useCallback(async () => {
    try {
      const { accessToken } = store.getState().auth

      await authService.unauthorize(accessToken)
      dispatch(authActions.unauthorizeSuccess())
    } catch (e) {
      if (accessTokenErrorIds.includes(e?.response?.data?.error_id)) {
        dispatch(authActions.unauthorizeSuccess()) // clean up access token
      }
      return Promise.reject(e)
    }
  }, [authService, dispatch, store])

  const authorize = useCallback(async () => {
    if (isLogin()) {
      await unauthorize() // invalidate current access token before requesting a new one
    }

    const { accessToken } = await authService.authorize()
    const user = await userService.getMe()
    return { user, accessToken }
  }, [authService, isLogin, unauthorize, userService])

  const login = useCallback(
    (loginData: AuthResult) => {
      axios.getSede().defaults.headers = {
        "auth-cookie": loginData.authCookie,
      }
      dispatch(authActions.authorizeSuccess(loginData))
    },
    [axios, dispatch]
  )

  const isTokenValid = useCallback(async () => {
    const { expireDate, accessToken } = store.getState().auth
    return authService.isTokenValid(accessToken, expireDate)
  }, [authService, store])

  return { isTokenValid, authorize, unauthorize, isLogin, login }
}

export function AuthProvider(props: PropsWithChildren<{}>) {
  const [value] = React.useState<Context>(useAuthContext())
  const { isTokenValid, unauthorize, isLogin } = value
  const { $try: tryUnauthorize } = useTry(unauthorize)

  React.useEffect(() => {
    if (isLogin()) {
      isTokenValid().then((isValid) => {
        if (!isValid) {
          return tryUnauthorize()
        }
      })
    }
    // eslint-disable-next-line
  }, [])

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  )
}
