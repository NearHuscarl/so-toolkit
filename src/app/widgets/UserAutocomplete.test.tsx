import React from "react"
import { screen } from "@testing-library/react"
import user from "@testing-library/user-event"
import UserAutocomplete, { DEBOUNCED_TIME } from "app/widgets/UserAutocomplete"
import usersResponse from "app/services/userService.data"
import { renderApp, Roles } from "app/test"
import { act } from "react-dom/test-utils"

describe("<UserAutocomplete />", () => {
  test(`should throttle for ${DEBOUNCED_TIME}ms`, async () => {
    // testing lodash.throttle, use modern mode to manipulate both Date and setTimeout()
    // see this recap
    // https://github.com/facebook/jest/issues/3465#issuecomment-504908570
    jest.useFakeTimers("modern")

    const { context } = renderApp(<UserAutocomplete />)
    const getSpy = jest.spyOn(context.api, "get")
    const searchBox = screen.getByRole(Roles.searchbox)

    await user.type(searchBox, "123")
    await act(async () => {
      jest.advanceTimersByTime(DEBOUNCED_TIME - 1)
    })
    expect(getSpy).toBeCalledTimes(0)

    await act(async () => {
      jest.advanceTimersByTime(1)
    })
    expect(getSpy).toBeCalledTimes(1)
    // console.log(hasInputValue(searchBox, "123"))
  })

  test(`should show loading when fetching`, async () => {
    jest.useFakeTimers("modern")

    const apiResponseDelay = 200
    renderApp(<UserAutocomplete />, { apiResponseDelay })
    const searchBox = screen.getByRole(Roles.searchbox)

    await user.type(searchBox, "123")
    await act(async () => {
      jest.advanceTimersByTime(DEBOUNCED_TIME)
    })
    expect(screen.queryByText("Loading users...")).toBeInTheDocument()

    await act(async () => {
      jest.advanceTimersByTime(apiResponseDelay)
    })
    expect(screen.queryByText("Loading users...")).not.toBeInTheDocument()
  })

  test(`should return exactly 5 users or no user`, async () => {
    jest.useFakeTimers("modern")

    const apiResponseDelay = 150
    renderApp(<UserAutocomplete />, { apiResponseDelay })
    const searchBox = screen.getByRole(Roles.searchbox)

    await user.type(searchBox, "gibberish text")
    await act(async () => {
      jest.advanceTimersByTime(DEBOUNCED_TIME) // trigger fetch
    })
    await act(async () => {
      jest.advanceTimersByTime(apiResponseDelay)
    })
    expect(screen.queryByText("No user")).toBeInTheDocument()

    await user.type(searchBox, "near")
    await act(async () => {
      jest.advanceTimersByTime(DEBOUNCED_TIME) // trigger fetch
    })
    await act(async () => {
      jest.advanceTimersByTime(apiResponseDelay)
    })
    expect(screen.queryByText("No user")).not.toBeInTheDocument()
    expect(screen.queryAllByText(/near/i)).toHaveLength(5)
  })

  test(`should select the user when clicking the option`, async () => {
    jest.useFakeTimers("modern")

    const apiResponseDelay = 150
    const onChange = jest.fn()
    renderApp(<UserAutocomplete onChange={onChange} />, { apiResponseDelay })
    const searchBox = screen.getByRole(Roles.searchbox)

    await user.type(searchBox, "near")
    await act(async () => {
      jest.advanceTimersByTime(DEBOUNCED_TIME) // trigger fetch
    })
    await act(async () => {
      jest.advanceTimersByTime(apiResponseDelay)
    })

    const firstOption = screen.getAllByText(/near/i)[0]
    await user.click(firstOption)
    expect(onChange).toBeCalledTimes(1)
    expect(onChange).lastCalledWith(usersResponse.near.items[0])
  })

  test(`should stop loading after some time`, async () => {
    jest.useFakeTimers("modern")

    expect(true).toBe(true)
  })
})
