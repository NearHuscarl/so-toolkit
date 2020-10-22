import { AxiosRequestConfig } from "axios"
import { matcherHint, printExpected, printReceived } from "jest-matcher-utils"

const failMessage = (received, expected, not) => () => `${matcherHint(
  `${not ? ".not" : ""}.toBeLastRequested`,
  "received",
  "expected"
)}

Expected url${not ? " not " : " "}to be:
  ${printExpected(expected)}
Received:
  ${printReceived(received)}`

export function lastRequestedWith(
  received: AxiosRequestConfig[],
  expected: string
) {
  const requestTimes = received.length
  const lastRequestedUrl = received[requestTimes - 1].url
  const pass = lastRequestedUrl === expected

  return {
    pass,
    message: failMessage(lastRequestedUrl, expected, pass),
  }
}
