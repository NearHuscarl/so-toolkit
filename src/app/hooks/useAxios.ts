import React from "react"
import { __PRODUCTION__ } from "app/constants"
import { AxiosContext, EMPTY_AXIOS_CONTEXT } from "app/providers/AxiosProvider"

export function useAxios() {
  const contextValue = React.useContext(AxiosContext)

  if (!__PRODUCTION__) {
    if (contextValue === EMPTY_AXIOS_CONTEXT) {
      throw new Error(
        "could not find axios context value; please ensure the component is wrapped in a <AxiosProvider>"
      )
    }
  }

  return contextValue
}
