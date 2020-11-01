import React, { PropsWithChildren, useCallback } from "react"
import { authActions, useDispatch, useStore } from "app/store"
import isAfter from "date-fns/isAfter"
import { useAxios, useSeApi, useTry } from "app/hooks"
import { AccessTokenResponse, ApiResponse, User } from "app/types"
import { accessTokenErrorIds, ApiError } from "app/helpers"

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
}

export const EMPTY_AUTH_CONTEXT = Object.freeze({} as any)
export const AuthContext = React.createContext<Context>(EMPTY_AUTH_CONTEXT)

function useAuthContext(): Context {
  const dispatch = useDispatch()
  const api = useAxios()
  const { userService, authService } = useSeApi()
  const store = useStore()
  const isLogin = useCallback(
    () => Boolean(store.getState().auth.accessToken),
    [store]
  )

  const unauthorize = useCallback(async () => {
    try {
      const { accessToken } = store.getState().auth

      if (!accessToken) return

      const { ...params } = api.defaults.params
      params.site = undefined // invalidate will throw if pass site params
      const response = await api.get<ApiResponse>(
        `access-tokens/${accessToken}/invalidate`,
        { params }
      )

      if (response.data.items?.length === 0) {
        throw new ApiError({
          id: -1,
          name: "Access token is either not available or already expired",
          message: "Logout failed",
        })
      }

      api.defaults.params.access_token = undefined
      dispatch(authActions.unauthorizeSuccess())
    } catch (e) {
      if (accessTokenErrorIds.includes(e?.response?.data?.error_id)) {
        dispatch(authActions.unauthorizeSuccess()) // clean up access token
      }
      return Promise.reject(e)
    }
  }, [api, dispatch, store])

  const authorize = useCallback(async () => {
    if (isLogin()) {
      await unauthorize() // invalidate current access token before requesting a new one
    }

    const { accessToken } = await authService.authorize()
    api.defaults.params.access_token = accessToken
    const user = await userService.getMe()
    return { user, accessToken }
  }, [api.defaults.params, authService, isLogin, unauthorize, userService])

  const isTokenValid = useCallback(async () => {
    const { expireDate, accessToken } = store.getState().auth
    const { ...params } = api.defaults.params
    params.access_token = undefined
    params.site = undefined // invalidate will throw if pass site params
    // the access token has no expire date and should never be invalid
    // unless we explicitly invalidate it when logging out but just in case
    const response = await api.get<AccessTokenResponse>(
      `access-tokens/${accessToken}`,
      { params }
    )
    const isValid = !!response.data.items?.some(
      (at) => at.access_token === accessToken
    )
    const isExpired = !expireDate || isAfter(Date.now(), Date.parse(expireDate))
    return isValid && !isExpired
  }, [api, store])

  return { isTokenValid, authorize, unauthorize, isLogin }
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
