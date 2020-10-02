import axios, { AxiosResponse } from "axios";
import { throttleAdapterEnhancer } from "axios-extensions";
import { ApiResponse, UserResponse } from "../types";
import { store, seApiActions } from "../store/index";

function createApi() {
  const api = axios.create({
    baseURL: "https://api.stackexchange.com/2.2/",
    adapter: throttleAdapterEnhancer(axios.defaults.adapter!, {
      threshold: 60 * 1000 * 30,
    }),
  });

  api.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      store.dispatch(
        seApiActions.setQuotaRemaining(response.data.quota_remaining)
      );
      return response;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return api;
}

export default class UserService {
  private static API = createApi();

  static getUser(userId: number) {
    return this.API.get<UserResponse>("users/" + userId, {
      params: {
        site: "stackoverflow",
      },
    }).then((response) => {
      console.log(response.data);
      return response.data.items[0];
    });
  }
}
