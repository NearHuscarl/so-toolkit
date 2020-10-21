// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect"
import isFunction from "lodash/isFunction"

expect.extend({
  toBeAxiosInstance(received) {
    const methods = ["get", "post", "put", "delete"]
    if (isFunction(received)) {
      const pass = methods.every((m) => isFunction(received[m]))

      if (pass) {
        return { pass: true, message: () => "" }
      }
    }

    return {
      pass: false,
      // TODO: add red/green color and prettify variable
      message: () => `${received} is not AxiosInstance`,
    }
  },
})

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAxiosInstance(): R
    }
  }
}
