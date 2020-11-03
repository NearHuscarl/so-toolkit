import React from "react"
import { MemoryRouter } from "react-router-dom"
import { screen } from "@testing-library/react"
import { renderApp, Roles } from "app/test"
import { AppBar } from "./AppBar"
import { mockAccessToken } from "app/test/fixtures"

describe("<AppBar />", () => {
  function getMenuButton() {
    return screen.queryByRole(Roles.button, { name: /menu/i })
  }

  it("should hide login button AND menu button when in login page", async () => {
    renderApp(
      <MemoryRouter initialEntries={["/login"]}>
        <AppBar />
      </MemoryRouter>
    )
    expect(screen.queryByText(/login/i)).not.toBeInTheDocument()
    expect(getMenuButton()).not.toBeInTheDocument()
  })

  it("should show login button when not in login page", async () => {
    renderApp(
      <MemoryRouter initialEntries={["/"]}>
        <AppBar />
      </MemoryRouter>
    )
    expect(screen.queryByText(/login/i)).toBeInTheDocument()
  })

  it("should show menu button when logged in", async () => {
    const loginState = {
      auth: { accessToken: mockAccessToken },
    }
    renderApp(
      <MemoryRouter initialEntries={["/"]}>
        <AppBar />
      </MemoryRouter>,
      { initialState: loginState }
    )

    expect(getMenuButton()).toBeInTheDocument()
  })
})
