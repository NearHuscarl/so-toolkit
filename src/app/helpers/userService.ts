import axios, { AxiosResponse } from "axios";
import { throttleAdapterEnhancer } from "axios-extensions";
import memoize from "lodash/memoize";
// NOTE: cannot use Debug directly in module scope when using this import syntax
// import { Debug } from "app/helpers";
import Debug from "app/helpers/debug";
import { ApiResponse, User, UserResponse } from "app/types";
import { seApiActions, store, userActions } from "app/store";
import { ApiCache } from "app/helpers";

const debug = Debug("cache");
const debugApi = Debug("api");

function createApi() {
  const api = axios.create({
    baseURL: "https://api.stackexchange.com/2.2/",
    adapter: throttleAdapterEnhancer(axios.defaults.adapter!, {
      threshold: 1000,
    }),
    params: {
      site: "stackoverflow",
      key: process.env.REACT_APP_STACK_APP_KEY,
    },
  });

  api.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      const { quota_remaining } = response.data;
      const oldQuotaRemaining = store.getState().seApi.quotaRemaining || 10_001;

      debugApi("quota_remaining: " + quota_remaining);

      if (oldQuotaRemaining > quota_remaining) {
        let message = "quota_changed: %c" + quota_remaining;
        const css = ["color: limegreen;"];
        const { inname } = response.config.params;

        if (inname) {
          message += " %c" + inname;
          css.push("color: crimson");
        }

        debugApi(message, ...css);
        store.dispatch(seApiActions.setQuotaRemaining(quota_remaining));
      }

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
    onGet: () => debug("cache hit"),
    onSet: (k, v, cache) => {
      store.dispatch(userActions.setUserCache(cache.dump()));
    },
  });

  return memoizedCb;
}

export type UserSortOption = "reputation" | "creation" | "name" | "modified";
export type UserOption = {
  sort?: UserSortOption;
  min?: number;
  max?: number;
  pagesize?: number;
};

export default class UserService {
  private static API = createApi();

  private static _getUserRaw = (userId: number) => {
    return UserService.API.get<UserResponse>("users/" + userId).then(
      (response) => response.data.items[0]
    );
  };
  private static _getUser: typeof UserService._getUserRaw;

  static get getUser() {
    if (!UserService._getUser) {
      UserService._getUser = memoizeApi(UserService._getUserRaw);
    }
    return UserService._getUser;
  }

  private static _getUserCache() {
    const _ = UserService.getUser; // make sure getUser is initialized
    return (UserService._getUser as any).cache as ApiCache<number, User>;
  }

  private static _getUserIdsByNameRaw = (
    name: string,
    options: UserOption = {}
  ) => {
    const { sort = "reputation", min, max, pagesize } = options;
    const params = { inname: name.trim(), sort, min, max, pagesize };

    return UserService.API.get<UserResponse>("users", { params }).then(
      (response) => {
        const users = response.data.items;
        const cache = UserService._getUserCache();

        users.forEach((u) => cache.set(u.user_id, u));

        return users.map((u) => u.user_id);
      }
    );
  };
  private static _getUserIdsByName: typeof UserService._getUserIdsByNameRaw;

  static get getUserIdsByName() {
    if (!UserService._getUserIdsByName) {
      const memoizedCb = memoize(UserService._getUserIdsByNameRaw);
      const { userSearchCache } = store.getState().user;

      memoizedCb.cache = new ApiCache<string, number[]>({
        cache: userSearchCache,
        max: 500,
        maxAge: 1000 * 60 * 60 * 24,
        keyResolver: (k, userIds) => {
          const cache = UserService._getUserCache();
          return userIds?.every((id) => cache.has(id)) || false;
        },
        onGet: () => debug("cache hit"),
        onSet: (k, v, cache) => {
          store.dispatch(userActions.setUserSearchCache(cache.dump()));
        },
      });

      UserService._getUserIdsByName = memoizedCb;
    }
    return UserService._getUserIdsByName;
  }

  static getUsersByName(name: string, options: UserOption) {
    return UserService.getUserIdsByName(name, options).then(
      (userIds: number[]) => {
        const cache = UserService._getUserCache();
        return userIds
          .map((id) => cache.getValue(id))
          .filter((u): u is User => !!u);
      }
    );
  }
}
