import MockAdapter from "axios-mock-adapter"
import { peopleReached } from "../fixtures"
import { PEOPLE_REACHED_REVISION_ID } from "app/sqlQueries"

export function pplReached(mock: MockAdapter) {
  mock
    .onPost(`/query/run/1/1321873/${PEOPLE_REACHED_REVISION_ID}`)
    .reply(() => {
      return [200, peopleReached]
    })

  return mock
}
