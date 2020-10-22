// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect"
import isFunction from "lodash/isFunction"
import { lastRequestedWith, nthRequestedWith } from "app/test/matchers"

expect.extend({
  toBeAxiosInstance(received) {
    let pass = false
    const methods = ["get", "post", "put", "delete"]

    if (isFunction(received)) {
      pass = methods.every((m) => isFunction(received[m]))
    }

    return {
      pass,
      // TODO: add red/green color and prettify variable
      message: () => `${received} is not AxiosInstance`,
    }
  },
  lastRequestedWith,
  nthRequestedWith,
})

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAxiosInstance(): R
      lastRequestedWith(expected: string): R
      nthRequestedWith(n: number, expected: string): R
    }
  }
}
