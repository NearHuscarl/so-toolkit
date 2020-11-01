import React from "react"
import { MemoryRouter } from "react-router-dom"
import { screen } from "@testing-library/react"
import { renderApp, renderMui } from "app/test"
import { AppBar } from "./AppBar"

describe("<AppBar />", () => {
  it("should hide login button when in login page", async () => {
    renderMui(
      <MemoryRouter initialEntries={["/login"]}>
        <AppBar />
      </MemoryRouter>
    )
    expect(screen.queryByText(/login/i)).not.toBeInTheDocument()
  })

  it("should show login button when not in login page", async () => {
    renderApp(
      <MemoryRouter initialEntries={["/"]}>
        <AppBar />
      </MemoryRouter>
    )
    expect(screen.queryByText(/login/i)).toBeInTheDocument()
  })
})
