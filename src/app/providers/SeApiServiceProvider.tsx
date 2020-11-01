import React, { PropsWithChildren } from "react"
import { AuthService, PplReachedService, UserService } from "app/services"
import { useStore } from "app/store"
import { useAxios } from "app/hooks"

type SeApiService = {
  userService: UserService
  pplReachedService: PplReachedService
  authService: AuthService
}

export const EMPTY_CONTEXT = Object.freeze({} as any)
export const SeApiContext = React.createContext<SeApiService>(EMPTY_CONTEXT)

type Props = PropsWithChildren<{
  service?: SeApiService
}>

export function SeApiServiceProvider(props: Props) {
  const store = useStore()
  const api = useAxios()
  const { children, service } = props
  const serviceProps = { store, api }
  const defaultSetter = () => ({
    userService: new UserService(serviceProps),
    pplReachedService: new PplReachedService(serviceProps),
    authService: new AuthService(serviceProps),
  })
  const [value] = React.useState<SeApiService>(service ?? defaultSetter)

  React.useEffect(() => {
    value.userService.API = api
  }, [api, value.userService])

  return <SeApiContext.Provider value={value}>{children}</SeApiContext.Provider>
}
