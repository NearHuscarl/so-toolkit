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
  const seProps = { store, api: api.getSe.bind(api) }
  const sedeProps = { store, api: api.getSede.bind(api) }
  const defaultSetter = () => ({
    userService: new UserService(seProps),
    authService: new AuthService(seProps),
    pplReachedService: new PplReachedService(sedeProps),
  })
  const [value] = React.useState<SeApiService>(service ?? defaultSetter)

  return <SeApiContext.Provider value={value}>{children}</SeApiContext.Provider>
}
