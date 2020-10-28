import MockAdapter from "axios-mock-adapter"
import { createApiResponse, mockAccessToken } from "app/test/fixtures"

function createAccessToken(accessToken: string) {
  return {
    account_id: 13078034,
    expires_on_date: 1603937812,
    access_token: accessToken,
  }
}

export function invalidate(mock: MockAdapter) {
  mock.onGet(`access-tokens/${mockAccessToken}/invalidate`).reply((config) => {
    return [200, createApiResponse([createAccessToken(mockAccessToken)])]
  })

  return mock
}

export function invalidate2(mock: MockAdapter) {
  mock.onGet(/access-tokens\/[a-zA-Z0-9()]\/invalidate/).reply((config) => {
    return [200, createApiResponse([])]
  })

  return mock
}

// TODO: extend to use route matcher, this is so painful
export function accessToken(mock: MockAdapter) {
  mock.onGet(/access-tokens\/.*/).reply((config) => {
    const accessToken = config.url?.split("/").pop() || ""

    if (accessToken === mockAccessToken) {
      return [200, createApiResponse([createAccessToken(mockAccessToken)])]
    }
    return [200, createApiResponse([])]
  })

  return mock
}
