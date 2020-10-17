import dumbUser from "@testing-library/user-event"
import { fireEvent } from "@testing-library/react"

export type TestingElement = Document | Element | Window | Node

export const user = Object.assign(dumbUser, {
  hover: (element: TestingElement | null) => {
    if (element) {
      fireEvent.mouseOver(element)
    }
  },
})
