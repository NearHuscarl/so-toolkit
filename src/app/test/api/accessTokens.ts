import MockAdapter from "axios-mock-adapter"
import { createApiResponse, mockAccessToken } from "app/test/fixtures"

export function invalidate(mock: MockAdapter) {
  mock.onGet(`access-tokens/${mockAccessToken}/invalidate`).reply((config) => {
    return [200, createApiResponse([mockAccessToken])]
  })

  return mock
}

export function invalidate2(mock: MockAdapter) {
  mock.onGet(/access-tokens\/[a-zA-Z0-9()]\/invalidate/).reply((config) => {
    return [200, createApiResponse([])]
  })

  return mock
}
