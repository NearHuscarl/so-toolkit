import axios, { AxiosInstance, AxiosResponse } from "axios"
import memoize from "lodash/memoize"
// NOTE: cannot use Debug directly in module scope when using this import syntax
// import { Debug } from "app/helpers";
import Debug from "app/helpers/debug"
import { ApiResponse, User, UserResponse } from "app/types"
import { seApiActions, AppStore, userActions } from "app/store"
import { ApiCache } from "app/helpers"
import { SE_API_URL } from "app/constants"
import { Entry } from "lru-cache"

const debug = Debug("cache")
const debugApi = Debug("api")

export function createApi(store: AppStore) {
  const api = axios.create({
    baseURL: SE_API_URL,
    params: {
      site: "stackoverflow",
      key: process.env.REACT_APP_STACK_APP_KEY,
    },
  })

  api.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      const { quota_remaining } = response.data
      const oldQuotaRemaining = store.getState().seApi.quotaRemaining || 10_001

      debugApi("quota_remaining: " + quota_remaining)

      if (oldQuotaRemaining > quota_remaining) {
        let message = "quota_changed: %c" + quota_remaining
        const css = ["color: limegreen;"]
        const { inname } = response.config.params

        if (inname) {
          message += " %c" + inname
          css.push("color: crimson")
        }

        debugApi(message, ...css)
        store.dispatch(seApiActions.setQuotaRemaining(quota_remaining))
      }

      return response
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  return api
}

export type UserSortOption = "reputation" | "creation" | "name" | "modified"
export type UserOption = {
  sort?: UserSortOption
  min?: number
  max?: number
  pagesize?: number
}

type Props = { store: AppStore; api?: AxiosInstance }

export default class UserService {
  static USER_CACHE_MAX_AGE = 1000 * 60 * 30
  static USER_SEARCH_CACHE_MAX_AGE = 1000 * 60 * 60 * 24

  private API: AxiosInstance
  getUser: (userId: number) => Promise<User>
  getUserIdsByName: (name: string, options: UserOption) => Promise<number[]>

  constructor(props: Props) {
    const { store, api = createApi(store) } = props
    const userState = store.getState().user

    this.API = api
    this.getUser = this._memoizeGetUser(userState.cache, (cache) =>
      store.dispatch(userActions.setUserCache(cache))
    )
    this.getUserIdsByName = this._memoizeGetUserIdsByName(
      userState.userSearchCache,
      (cache) => store.dispatch(userActions.setUserSearchCache(cache))
    )
  }

  private _memoizeGetUser = <K extends number, V extends User>(
    initialCache: Entry<K, V>[],
    setCacheAction: (cache: Entry<K, V>[]) => void
  ) => {
    const memoizedCb = memoize(this._getUserRaw)

    memoizedCb.cache = new ApiCache<K, V>({
      cache: initialCache,
      max: 60,
      maxAge: UserService.USER_CACHE_MAX_AGE,
      onGet: () => debug("cache hit"),
      onSet: (k, v, cache) => setCacheAction(cache.dump()),
    })

    return memoizedCb
  }

  private _memoizeGetUserIdsByName<K extends string, V extends number[]>(
    initialCache: Entry<K, V>[],
    setCacheAction: (cache: Entry<K, V>[]) => void
  ) {
    const memoizedCb = memoize(this._getUserIdsByNameRaw)

    memoizedCb.cache = new ApiCache<K, V>({
      cache: initialCache,
      max: 500,
      maxAge: UserService.USER_SEARCH_CACHE_MAX_AGE,
      keyResolver: (k, userIds, isPromisePending) => {
        if (isPromisePending) {
          return true
        }
        const cache = this._getUserCache()
        const dump = cache.dumpRaw()

        dump.forEach((e) => {
          if (userIds?.includes(e.k) && cache.isStale(e)) {
            cache.set(e.k, e.v) // update expire time
          }
        })
        return userIds?.every((id) => cache.has(id)) || false
      },
      onGet: () => debug("cache hit"),
      onSet: (k, v, cache) => setCacheAction(cache.dump()),
    })

    return memoizedCb
  }

  private _getUserRaw = (userId: number) => {
    return this.API.get<UserResponse>("users/" + userId).then(
      (response) => response.data.items[0]
    )
  }

  private _getUserCache = () => {
    return (this.getUser as any).cache as ApiCache<number, User>
  }

  private _getUserIdsByNameRaw = (name: string, options: UserOption = {}) => {
    const { sort = "reputation", min, max, pagesize } = options
    const params = { inname: name.trim(), sort, min, max, pagesize }

    return this.API.get<UserResponse>("users", { params }).then((response) => {
      const users = response.data.items
      const cache = this._getUserCache()

      users.forEach((u) => cache.set(u.user_id, u))

      return users.map((u) => u.user_id)
    })
  }

  getUsersByName = (name: string, options: UserOption = {}) => {
    return this.getUserIdsByName(name, options).then((userIds: number[]) => {
      const cache = this._getUserCache()
      return userIds
        .map((id) => cache.getValue(id))
        .filter((u): u is User => !!u)
    })
  }
}
