// See https://stackoverflow.com/a/63745654/9449426 for more info
import { screen } from "@testing-library/react"

export function hasInputValue(e, inputValue: string) {
  return screen.getByDisplayValue(inputValue) === e
}
