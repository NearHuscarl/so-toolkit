import React, { PropsWithChildren } from "react"
import { UserService } from "app/services"
import { useStore } from "app/store"

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
  const initialValueCreator = () => ({
    userService: new UserService({ store }),
  })
  const [value] = React.useState<SeApiService>(
    props?.service || initialValueCreator
  )

  return (
    <SeApiContext.Provider value={value}>
      {props.children}
    </SeApiContext.Provider>
  )
}
