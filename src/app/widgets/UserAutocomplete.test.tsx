import React from "react"
import { screen } from "@testing-library/react"
import UserAutocomplete, { DEBOUNCED_TIME } from "app/widgets/UserAutocomplete"
import { renderApp, Roles, user } from "app/test"
import { act } from "react-dom/test-utils"
import { createUsersMatching } from "app/test/fixtures"

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

  it(`should return exactly 5 users or no user`, async () => {
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

  it(`should select the user when clicking the option`, async () => {
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
    expect(onChange).lastCalledWith(
      expect.objectContaining(createUsersMatching("near"))
    )
  })

  it(`should stop loading and show error snackbar when failed`, async () => {
    const apiResponseDelay = 115
    renderApp(<UserAutocomplete />, { apiResponseDelay })
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
    const apiResponseDelay = 256
    renderApp(<UserAutocomplete />, { apiResponseDelay })
    const searchBox = screen.getByRole(Roles.searchbox)

    await user.type(searchBox, "near")
    await act(async () => {
      jest.advanceTimersByTime(DEBOUNCED_TIME) // trigger fetch
    })
    await act(async () => {
      jest.advanceTimersByTime(apiResponseDelay)
    })

    const userReputations = screen.getAllByTitle(/reputation/i)
    const reputations = userReputations.map((r) =>
      parseFloat(r.textContent!.replace(",", ""))
    )
    const sortedReputations = reputations.slice().sort((a, b) => b - a)

    expect(reputations).toEqual(sortedReputations)
  })

  it("Users who are moderators should have a moderator badge", async () => {
    const apiResponseDelay = 169
    renderApp(<UserAutocomplete />, { apiResponseDelay })
    const searchBox = screen.getByRole(Roles.searchbox)

    await user.type(searchBox, "machavity") // this guy is a moderator
    await act(async () => {
      jest.advanceTimersByTime(DEBOUNCED_TIME) // trigger fetch
    })
    await act(async () => {
      jest.advanceTimersByTime(apiResponseDelay)
    })

    let modFlair = screen.queryByText("♦")
    expect(modFlair).toBeInTheDocument()

    await user.hover(modFlair)
    await act(async () => {
      jest.advanceTimersByTime(100) // wait for tooltip to show up
    })
    const modFlairTooltip = screen.queryByText("This user is a moderator")
    expect(modFlairTooltip).toBeInTheDocument()

    await user.type(searchBox, "near") // regular user
    await act(async () => {
      jest.advanceTimersByTime(DEBOUNCED_TIME) // trigger fetch
    })
    await act(async () => {
      jest.advanceTimersByTime(apiResponseDelay)
    })

    modFlair = screen.queryByText("♦")
    expect(modFlair).not.toBeInTheDocument()
  })
})
