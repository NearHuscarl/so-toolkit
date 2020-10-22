import { AxiosRequestConfig } from "axios"
import { matcherHint, printExpected, printReceived } from "jest-matcher-utils"

const failMessage = (n, received, expected, not) => () => `${matcherHint(
  `${not ? ".not" : ""}.nthRequestedWith`,
  "received",
  `${n}, expected`
)}

Expected url${not ? " not " : " "}to be:
  ${printExpected(expected)}
Received:
  ${printReceived(received)}`

export function nthRequestedWith(
  received: AxiosRequestConfig[],
  n: number,
  expected: string
) {
  const nthRequestedUrl = received[n - 1].url
  const pass = nthRequestedUrl === expected

  return {
    pass,
    message: failMessage(n, nthRequestedUrl, expected, pass),
  }
}
