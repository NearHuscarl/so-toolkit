import React, { PropsWithChildren, useCallback } from "react"
import { authActions, useDispatch, useStore } from "app/store"
import { authenticate } from "app/helpers/oauth"
import isBefore from "date-fns/isBefore"
import { useAxios, useSeApi, useSnackbar } from "app/hooks"
import { ApiResponse } from "app/types"
import { accessTokenErrorIds, ApiError, getApiError } from "app/helpers"
import { AuthorizeResult } from "app/store/auth.duck"

type Context = {
  accessToken?: string
  isTokenValid: () => boolean
  isLogin: () => boolean
  authorize: () => Promise<AuthorizeResult>
  unauthorize: () => Promise<void>
}

export const EMPTY_AUTH_CONTEXT = Object.freeze({} as any)
export const AuthContext = React.createContext<Context>(EMPTY_AUTH_CONTEXT)

function useAuthContext(): Context {
  const dispatch = useDispatch()
  const api = useAxios()
  const { userService } = useSeApi()
  const store = useStore()
  const isLogin = useCallback(
    () => Boolean(store.getState().auth.accessToken),
    [store]
  )

  const unauthorize = useCallback(async () => {
    try {
      dispatch(authActions.unauthorizeRequest())
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
      } else {
        dispatch(authActions.unauthorizeFailure())
      }
      return Promise.reject(getApiError(e))
    }
  }, [api, dispatch, store])

  const authorize = useCallback(async () => {
    try {
      dispatch(authActions.authorizeRequest())

      if (isLogin()) {
        await unauthorize() // invalidate current access token before requesting a new one
      }

      const { accessToken } = await authenticate({
        redirectUri: window.location.origin + "/login/success",
        clientId: Number(process.env.REACT_APP_STACK_APP_CLIENT_ID!),
        // default expire interval is too short and can't be changed
        // https://stackapps.com/a/6720/72145
        // TODO: uncomment after doing more testing to make sure nothing goes wrong
        // scope: ["no_expiry"],
      })

      api.defaults.params.access_token = accessToken
      const user = await userService.getMe()
      const result = { user, accessToken }
      dispatch(authActions.authorizeSuccess(result))

      return result
    } catch (e) {
      dispatch(authActions.authorizeFailure())

      return Promise.reject(getApiError(e))
    }
  }, [api.defaults.params, dispatch, isLogin, unauthorize, userService])

  const isTokenValid = useCallback(() => {
    const { expireDate } = store.getState().auth
    return Boolean(
      isLogin() && expireDate && isBefore(Date.now(), Date.parse(expireDate))
    )
  }, [isLogin, store])

  return { isTokenValid, authorize, unauthorize, isLogin }
}

export function AuthProvider(props: PropsWithChildren<{}>) {
  const [value] = React.useState<Context>(useAuthContext())
  const { createErrorSnackbar } = useSnackbar()

  React.useEffect(() => {
    const { isTokenValid, unauthorize, isLogin } = value

    if (isLogin() && !isTokenValid()) {
      unauthorize().catch((e) => createErrorSnackbar(e))
    }
    // eslint-disable-next-line
  }, [])

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  )
}
