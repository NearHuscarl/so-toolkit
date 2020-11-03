import React from "react"
import { MemoryRouter } from "react-router-dom"
import { screen } from "@testing-library/react"
import { renderMui } from "app/test"
import { AppDrawer } from "./AppDrawer"

describe("<AppDrawer />", () => {
  const highlightedStyle = {
    fontWeight: "bold",
  }

  describe("should highlight active route correctly", () => {
    it("highlight /people-reached", async () => {
      renderMui(
        <MemoryRouter initialEntries={["/people-reached"]}>
          <AppDrawer open />
        </MemoryRouter>
      )
      expect(screen.getByText(/home/i)).not.toHaveStyle(highlightedStyle)
      expect(screen.getByText(/people reached/i)).toHaveStyle(highlightedStyle)
    })

    it("highlight /", async () => {
      renderMui(
        <MemoryRouter initialEntries={["/"]}>
          <AppDrawer open />
        </MemoryRouter>
      )
      expect(screen.getByText(/home/i)).toHaveStyle(highlightedStyle)
      expect(screen.getByText(/people reached/i)).not.toHaveStyle(
        highlightedStyle
      )
    })
  })
})
