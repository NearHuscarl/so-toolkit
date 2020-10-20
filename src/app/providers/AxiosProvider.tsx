import React, { PropsWithChildren } from "react"
import { AxiosInstance } from "axios"
import { useStore } from "app/store"
import { createApi } from "app/helpers"

export const EMPTY_AXIOS_CONTEXT = Object.freeze({} as any)
export const AxiosContext = React.createContext<AxiosInstance>(
  EMPTY_AXIOS_CONTEXT
)

/*
 * Use this provider to make sure all services provider wrapped inside it
 * use the same AxiosInstance
 */
export function AxiosProvider(props: PropsWithChildren<{}>) {
  const store = useStore()
  const [value] = React.useState<AxiosInstance>(() => createApi(store))

  return (
    <AxiosContext.Provider value={value}>
      {props.children}
    </AxiosContext.Provider>
  )
}
