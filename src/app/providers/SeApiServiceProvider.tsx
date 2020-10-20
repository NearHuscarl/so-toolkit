import React, { PropsWithChildren } from "react"
import { UserService } from "app/services"
import { useStore } from "app/store"
import { useAxios } from "app/hooks"

type SeApiService = {
  userService: UserService
}

export const EMPTY_CONTEXT = Object.freeze({} as any)
export const SeApiContext = React.createContext<SeApiService>(EMPTY_CONTEXT)

type Props = PropsWithChildren<{
  service?: SeApiService
}>

export default function SeApiServiceProvider(props: Props) {
  const store = useStore()
  const api = useAxios()
  const { children, service } = props
  const defaultSetter = () => ({
    userService: new UserService({ store, api }),
  })
  const [value] = React.useState<SeApiService>(service ?? defaultSetter)

  React.useEffect(() => {
    value.userService.API = api
  }, [api, value.userService])

  return <SeApiContext.Provider value={value}>{children}</SeApiContext.Provider>
}
