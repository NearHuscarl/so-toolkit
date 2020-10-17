import React from "react"
import { screen } from "@testing-library/react"
import user from "@testing-library/user-event"
import UserAutocomplete, { DEBOUNCED_TIME } from "app/widgets/UserAutocomplete"
import { renderApp, Roles } from "app/test"
import { act } from "react-dom/test-utils"

describe("<UserAutocomplete />", () => {
  beforeEach(() => {
    // testing lodash.throttle, use modern mode to manipulate both Date and setTimeout()
    // see this recap
    // https://github.com/facebook/jest/issues/3465#issuecomment-504908570
    jest.useFakeTimers("modern")
  })

  it(`should throttle for ${DEBOUNCED_TIME}ms`, async () => {
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

  it(`should show loading when fetching`, async () => {
    const apiResponseDelay = 400
    renderApp(<UserAutocomplete />)
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

  it(`should return exactly 5 users or no user`, async () => {
    const apiResponseDelay = 4000
    renderApp(<UserAutocomplete />)
    const searchBox = screen.getByRole(Roles.searchbox)
    const getNow = () => new Date(Date.now()).toISOString()

    await user.type(searchBox, "gibberish text")
    console.log(getNow(), "type done")
    await act(async () => {
      await jest.advanceTimersByTime(DEBOUNCED_TIME) // trigger fetch
    })
    console.log(getNow(), "debounce done")
    await act(async () => {
      jest.advanceTimersByTime(apiResponseDelay)
    })
    console.log(getNow(), "should have now")
    expect(screen.queryByText("No user")).toBeInTheDocument()

    await user.type(searchBox, "near")
    await act(async () => {
      jest.advanceTimersByTime(DEBOUNCED_TIME) // trigger fetch
    })
    console.log(getNow(), "debounce done")

    await act(async () => {
      jest.advanceTimersByTime(apiResponseDelay)
    })
    console.log(getNow(), "should have now1")
    await act(async () => {
      jest.advanceTimersByTime(1)
    })
    console.log(getNow(), "should have now2")
    // await act(async () => {
    //   jest.advanceTimersByTime(apiResponseDelay)
    // })
    // console.log(getNow(), "should have now")
    expect(screen.queryByText("No user")).not.toBeInTheDocument()
    expect(screen.queryAllByText(/near/i)).toHaveLength(5)
  })

  it(`should select the user when clicking the option`, async () => {
    const apiResponseDelay = 400
    const onChange = jest.fn()
    renderApp(<UserAutocomplete onChange={onChange} />)
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
    expect(onChange).lastCalledWith({
      display_name: expect.stringMatching(/near/i),
    })
  })

  it(`should stop loading and show error snackbar when failed`, async () => {
    const apiResponseDelay = 400
    renderApp(<UserAutocomplete />)
    const searchBox = screen.getByRole(Roles.searchbox)

    await user.type(searchBox, "throw")
    await act(async () => {
      jest.advanceTimersByTime(DEBOUNCED_TIME) // trigger fetch
    })
    await act(async () => {
      jest.advanceTimersByTime(apiResponseDelay)
    })

    expect(screen.queryByText("Loading users...")).not.toBeInTheDocument()
    expect(
      screen.queryByText(/Violation of backoff parameter/i)
    ).toBeInTheDocument()
  })

  it(`results should be sorted by reputation in descending order`, async () => {
    expect(true).toBeTruthy() // TODO
  })
})
