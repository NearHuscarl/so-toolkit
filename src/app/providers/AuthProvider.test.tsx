import React from "react"

describe("<AuthProvider />", () => {
  it("should provide auth helpers via useAuth if components are children of <AuthProvider/>", () => {
    // TODO
  })

  it("should update api params when accessToken is updated", () => {
    // TODO
  })

  it("should implicitly logout if access token is expired", () => {
    // TODO
  })

  // TODO: maybe put this in useAuth.test?
  it("should invalidate current access token before requesting a new one", () => {
    // TODO
  })
})
