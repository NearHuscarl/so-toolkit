import React from "react"
import { screen } from "@testing-library/react"
import { Badges } from "app/widgets"
import { renderMui } from "app/test"

describe("<Badges />", () => {
  it(`should not show badge if number of badge is 0`, async () => {
    const { rerender } = renderMui(
      <Badges badge={{ bronze: 0, silver: 0, gold: 0 }} />
    )

    expect(screen.queryByTitle("bronze badge")).not.toBeInTheDocument()
    expect(screen.queryByTitle("silver badge")).not.toBeInTheDocument()
    expect(screen.queryByTitle("gold badge")).not.toBeInTheDocument()

    rerender(<Badges badge={{ bronze: 1, silver: 0, gold: 0 }} />)

    expect(screen.queryByTitle("bronze badge")).toBeInTheDocument()
    expect(screen.queryByTitle("silver badge")).not.toBeInTheDocument()
    expect(screen.queryByTitle("gold badge")).not.toBeInTheDocument()

    rerender(<Badges badge={{ bronze: 20, silver: 4, gold: 0 }} />)

    expect(screen.queryByTitle("bronze badge")).toBeInTheDocument()
    expect(screen.queryByTitle("silver badge")).toBeInTheDocument()
    expect(screen.queryByTitle("gold badge")).not.toBeInTheDocument()

    rerender(<Badges badge={{ bronze: 69, silver: 13, gold: 2 }} />)

    expect(screen.queryByTitle("bronze badge")).toBeInTheDocument()
    expect(screen.queryByTitle("silver badge")).toBeInTheDocument()
    expect(screen.queryByTitle("gold badge")).toBeInTheDocument()
  })
})
