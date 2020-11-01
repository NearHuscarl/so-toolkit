import axios from "axios"
import { ServiceBase } from "app/services/serviceBase"
import { ApiError, authenticate } from "app/helpers"
import { SEDE_AUTH_URL } from "app/constants"
import { AppStore } from "app/store"

export type LoginSEDEData = {
  email: string
  password: string
}

export type LoginSEDEResponse = {
  authCookie: string
}

export type OAuthResponse = {
  access_token: string
}
type Props = { store: AppStore }

export class AuthService extends ServiceBase {
  constructor(props: Props) {
    const { store } = props
    const api = axios.create({ baseURL: SEDE_AUTH_URL })

    super({ api, store })
  }

  loginSEDE(formData: LoginSEDEData) {
    const body = new URLSearchParams(formData)
    return this.API.post<LoginSEDEResponse>("/auth", body).then(
      (r) => r,
      (e) =>
        Promise.reject(
          new ApiError({
            id: -1,
            name: "Login failed",
            message: e.response.data.error,
          })
        )
    )
  }

  authorize() {
    return authenticate({
      redirectUri: window.location.origin + "/login/success",
      clientId: Number(process.env.REACT_APP_STACK_APP_CLIENT_ID!),
      // default expire interval is too short and can't be changed
      // https://stackapps.com/a/6720/72145
      // TODO: uncomment after doing more testing to make sure nothing goes wrong
      // scope: ["no_expiry"],
    })
  }
}
