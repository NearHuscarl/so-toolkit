import React from "react"
import { screen } from "@testing-library/react"
import { Highlighter } from "app/widgets"
import { renderMui } from "app/test"

describe("<Highlighter />", () => {
  const highlightedStyle = {
    backgroundColor: "rgba(63,81,181,.2)",
  }

  it(`should ignore word boundary`, async () => {
    renderMui(<Highlighter textToHighlight="Near Huscarl" searchWord="sca" />)

    expect(screen.queryByText("Near Hu")).not.toHaveStyle(highlightedStyle)
    expect(screen.queryByText("sca")).toHaveStyle(highlightedStyle)
    expect(screen.queryByText("rl")).not.toHaveStyle(highlightedStyle)
  })

  it(`should ignore case`, async () => {
    renderMui(<Highlighter textToHighlight="Near Huscarl" searchWord="near" />)

    expect(screen.queryByText("Near")).toHaveStyle(highlightedStyle)
    expect(screen.queryByText("Huscarl")).not.toHaveStyle(highlightedStyle)
  })
})
