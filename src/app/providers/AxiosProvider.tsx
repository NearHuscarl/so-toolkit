import React, { PropsWithChildren } from "react"
import { AxiosInstance } from "axios"
import { useSelector, useStore } from "app/store"
import { createApi } from "app/helpers"

export const EMPTY_AXIOS_CONTEXT = Object.freeze({} as any)
export const AxiosContext = React.createContext<AxiosInstance>(
  EMPTY_AXIOS_CONTEXT
)

type AxiosProviderProps = PropsWithChildren<{
  api?: AxiosInstance
}>

/*
 * Use this provider to make sure all services provider wrapped inside it
 * use the same AxiosInstance
 */
export function AxiosProvider(props: AxiosProviderProps) {
  const store = useStore()
  const accessToken = useSelector((state) => state.auth.accessToken)
  const { api } = props
  // must use callback here. https://stackoverflow.com/a/64427614/9449426
  const apiSetter = api ? () => api : undefined
  const defaultSetter = () => createApi(store)
  const [value] = React.useState<AxiosInstance>(apiSetter ?? defaultSetter)

  React.useEffect(() => {
    value.defaults.params.access_token = accessToken
  }, [accessToken, value.defaults.params])

  return (
    <AxiosContext.Provider value={value}>
      {props.children}
    </AxiosContext.Provider>
  )
}
