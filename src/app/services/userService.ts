import { AxiosInstance } from "axios"
import memoize from "lodash/memoize"
// NOTE: cannot use Debug directly in module scope when using this import syntax
// import { Debug } from "app/helpers";
import Debug from "app/helpers/debug"
import { User, UserResponse } from "app/types"
import { AppStore, userActions } from "app/store"
import { ApiCache, createApi, getApiError } from "app/helpers"
import { Entry } from "lru-cache"

const debug = Debug("cache")

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
      (response) => response.data.items![0],
      (e) => Promise.reject(getApiError(e))
    )
  }

  private _getUserCache = () => {
    return (this.getUser as any).cache as ApiCache<number, User>
  }

  private _getUserIdsByNameRaw = (name: string, options: UserOption = {}) => {
    const { sort = "reputation", min, max, pagesize } = options
    const params = { inname: name.trim(), sort, min, max, pagesize }

    return this.API.get<UserResponse>("users", { params }).then(
      (response) => {
        const users = response.data.items!
        const cache = this._getUserCache()

        users.forEach((u) => cache.set(u.user_id, u))

        return users.map((u) => u.user_id)
      },
      (e) => Promise.reject(getApiError(e))
    )
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
