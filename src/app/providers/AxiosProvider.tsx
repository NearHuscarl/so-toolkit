import React, { PropsWithChildren } from "react"
import { AxiosInstance } from "axios"
import { useSelector, useStore } from "app/store"
import { createSeApi, createSedeApi } from "app/helpers"

export const EMPTY_AXIOS_CONTEXT = Object.freeze({} as any)
export const AxiosContext = React.createContext<AxiosProviderContext>(
  EMPTY_AXIOS_CONTEXT
)

type AxiosProviderProps = PropsWithChildren<{
  sede?: AxiosInstance
  se?: AxiosInstance
}>

type AxiosProviderContext = {
  getSede: () => AxiosInstance
  getSe: () => AxiosInstance
}

/*
 * Use this provider to make sure all services provider wrapped inside it
 * use the same AxiosInstance
 */
export function AxiosProvider(props: AxiosProviderProps) {
  const store = useStore()
  const accessToken = useSelector((state) => state.auth.accessToken)
  const authCookie = useSelector((state) => state.auth.authCookie)
  const { se, sede } = props
  const defaultSetter = () => {
    const v = {
      _sede: sede || createSedeApi(store),
      _se: se || createSeApi(store),
      getSede: function () {
        return this._sede
      },
      getSe: function () {
        return this._se
      },
    }

    v.getSede = v.getSede.bind(v)
    v.getSe = v.getSe.bind(v)

    return v
  }
  const [value] = React.useState<AxiosProviderContext>(defaultSetter)

  React.useEffect(() => {
    value.getSe().defaults.params.access_token = accessToken
    value.getSede().defaults.headers = {
      "auth-cookie": authCookie,
    }
  }, [accessToken, authCookie, value])

  return (
    <AxiosContext.Provider value={value}>
      {props.children}
    </AxiosContext.Provider>
  )
}
