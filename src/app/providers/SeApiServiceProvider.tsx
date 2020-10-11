import React, { PropsWithChildren } from "react"
import { UserService } from "app/services"
import { useStore } from "app/store"

type SeApiService = {
  userService: UserService
}

export const EMPTY_CONTEXT = Object.freeze({} as any)
export const SeApiContext = React.createContext<SeApiService>(EMPTY_CONTEXT)

export default function SeApiServiceProvider(props: PropsWithChildren<{}>) {
  const store = useStore()
  const [value] = React.useState<SeApiService>(() => ({
    userService: new UserService({ store }),
  }))

  return (
    <SeApiContext.Provider value={value}>
      {props.children}
    </SeApiContext.Provider>
  )
}
