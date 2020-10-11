import React from "react"
import { __DEV__ } from "app/constants"
import { EMPTY_CONTEXT, SeApiContext } from "app/providers/SeApiServiceProvider"

export default function useSeApi() {
  const contextValue = React.useContext(SeApiContext)

  if (__DEV__) {
    if (contextValue === EMPTY_CONTEXT) {
      throw new Error(
        "could not find SE API service context value; please ensure the component is wrapped in a <SeApiServiceProvider>"
      )
    }
  }

  return contextValue
}
