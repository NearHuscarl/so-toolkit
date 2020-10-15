import React from "react"
import { render, screen } from "@testing-library/react"
import user from "@testing-library/user-event"
import { SnackbarProvider } from "./SnackbarProvider"
import { Roles, toThrowSilently } from "app/test"
import { useSnackbar } from "app/hooks"

describe("<SnackbarProvider />", () => {
  it("should provide the API to children", async () => {
    function Test() {
      const { createSnackbar } = useSnackbar()
      const openSnack = () => createSnackbar("This is a snackbar")
      return (
        <button onClick={openSnack} data-testid="me">
          Click
        </button>
      )
    }
    render(
      <SnackbarProvider>
        <Test />
      </SnackbarProvider>
    )

    const button = screen.getByRole(Roles.button)
    await user.click(button)

    expect(screen.queryByText("This is a snackbar")).toBeInTheDocument()
  })

  it("should throw if children who use useSnackbar() and is not wrapped inside <SnackbarProvider />", () => {
    function Test() {
      useSnackbar()
      return <>nothing</>
    }
    const app = () => render(<Test />)
    toThrowSilently(app, "could not find snackbar context value;")

    const app1 = () =>
      render(
        <SnackbarProvider>
          <Test />
        </SnackbarProvider>
      )
    expect(app1).not.toThrow()
  })
})
