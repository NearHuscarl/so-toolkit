import axios, { AxiosResponse } from "axios";
import { throttleAdapterEnhancer } from "axios-extensions";
import memoize from "lodash/memoize";
// NOTE: cannot use Debug directly in module scope when using this import syntax
// import { Debug } from "app/helpers";
import Debug from "app/helpers/debug";
import { ApiResponse, User, UserResponse } from "app/types";
import { store, seApiActions, userActions } from "app/store";
import { ApiCache } from "app/helpers";

const debug = Debug("cache");

function createApi() {
  const api = axios.create({
    baseURL: "https://api.stackexchange.com/2.2/",
    adapter: throttleAdapterEnhancer(axios.defaults.adapter!, {
      threshold: 1000 * 2,
    }),
  });

  api.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      const { quota_remaining } = response.data;

      debug("quota_remaining: " + quota_remaining);
      store.dispatch(seApiActions.setQuotaRemaining(quota_remaining));

      return response;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return api;
}

type AnyFunction = (...any: any) => any;

function memoizeApi<T extends AnyFunction>(cb: T): T {
  const memoizedCb = memoize(cb);
  const { cache } = store.getState().user;

  memoizedCb.cache = new ApiCache<number, User>({
    cache,
    onGet: (k, v) => debug("cache hit"),
    onSet: (k, v, cache) => {
      store.dispatch(userActions.setUserCache(cache.dump()));
    },
  });

  return memoizedCb;
}

export default class UserService {
  private static API = createApi();

  private static _getUserRaw = (userId: number) => {
    return UserService.API.get<UserResponse>("users/" + userId, {
      params: {
        site: "stackoverflow",
      },
    }).then((response) => {
      console.log(response.data);
      return response.data.items[0];
    });
  };
  private static _getUser: typeof UserService._getUserRaw;

  static get getUser() {
    if (!this._getUser) {
      UserService._getUser = memoizeApi(UserService._getUserRaw);
    }
    return this._getUser;
  }
}
