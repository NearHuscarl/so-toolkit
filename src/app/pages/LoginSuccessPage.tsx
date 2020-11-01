import React from "react"
import { serializeSearchParams } from "app/helpers"

export function LoginSuccessPage() {
  React.useEffect(() => {
    const queryString = window.location.hash.replace(/^#/, "")
    const { access_token: accessToken, expires } = serializeSearchParams(
      new URLSearchParams(queryString)
    ) as any
    const expireDate = new Date(new Date().getTime() + expires * 1000)

    window.opener.resolveOauthPopup({ accessToken, expireDate })
    window.opener.resolveOauthPopup = undefined
    window.close()
  }, [])

  return <div>Login success!</div>
}
