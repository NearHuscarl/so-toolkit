import React from "react"
import { __PRODUCTION__ } from "app/constants"
import { AuthContext, EMPTY_AUTH_CONTEXT } from "app/providers/AuthProvider"

export function useAuth() {
  const contextValue = React.useContext(AuthContext)

  if (!__PRODUCTION__) {
    if (contextValue === EMPTY_AUTH_CONTEXT) {
      throw new Error(
        "could not find auth context value; please ensure the component is wrapped in a <AuthProvider>"
      )
    }
  }

  return contextValue
}
