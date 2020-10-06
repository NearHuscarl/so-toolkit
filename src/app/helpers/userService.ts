import axios, { AxiosResponse } from "axios";
import LRU from "lru-cache";
import memoize from "lodash/memoize";
// NOTE: cannot use Debug directly in module scope when using this import syntax
// import { Debug } from 'app/helpers'
import Debug from "app/helpers/debug";
import { ApiResponse, User, UserResponse } from "app/types";
import { store, seApiActions, userActions } from "app/store";
import { isPromise } from "app/helpers";
import { throttleAdapterEnhancer } from "axios-extensions";

const debug = Debug("cache");

interface IMapCache<K, V> {
  clear(): void;
  delete(key: K): boolean;
  get(key: K): V | undefined;
  has(key: K): boolean;
  set(key: K, value: V): IMapCache<K, V>;
}

type OnSetCallback<K, V> = (k: K, v: V, cache: LRU<K, V>) => void;
type CacheSettings<K, V> = {
  onSet?: OnSetCallback<K, V>;
  cache?: LRU.Entry<K, V>[];
};

// copied from https://stackoverflow.com/a/30112075/9449426
// but only implement methods required by lodash.memoize.Cache
// See: https://lodash.com/docs/#memoize
class ApiCache<K extends string | number, V extends any>
  implements IMapCache<K, V> {
  private _cache = new LRU<K, V>({
    max: 30,
    maxAge: 1000 * 60 * 10,
  });
  private readonly onSet?: OnSetCallback<K, V>;

  constructor(settings: CacheSettings<K, V> = {}) {
    const { onSet, cache } = settings;
    this.onSet = onSet;

    if (cache) {
      this._cache.load(cache);
    }
  }

  clear(): void {
    this._cache.reset();
  }

  delete(key: K): boolean {
    if (this.has(key)) {
      this._cache.del(key);
      return true;
    }
    return false;
  }

  get(key: K): V | undefined {
    const hit = this._cache.get(key);
    if (hit !== undefined) {
      debug("cache hit");
    }
    return hit;
  }

  has(key: K): boolean {
    return this._cache.has(key);
  }

  private _set(key: K, value: V) {
    const result = this._cache.set(key, value);

    if (result) {
      this.onSet && this.onSet(key, value, this._cache);
    }
  }

  set(key: K, value: V): IMapCache<K, V> {
    if (isPromise(value)) {
      value.then((v) => this._set(key, v));
    } else {
      this._set(key, value);
    }
    return this;
  }
}

function createApi() {
  const api = axios.create({
    baseURL: "https://api.stackexchange.com/2.2/",
    adapter: throttleAdapterEnhancer(axios.defaults.adapter!, {
      threshold: 1000 * 2,
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

type AnyFunction = (...any: any) => any;

function memoizeApi<T extends AnyFunction>(cb: T): T {
  const memoizedCb = memoize(cb);
  const { cache } = store.getState().user;

  memoizedCb.cache = new ApiCache<number, User>({
    cache,
    onSet: (k, v, cache) =>
      store.dispatch(userActions.setUserCache(cache.dump())),
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
