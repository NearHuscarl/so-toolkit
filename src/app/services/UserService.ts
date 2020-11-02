import { AxiosInstance } from "axios"
import LRUCache, { Entry } from "lru-cache"
import memoize from "lodash/memoize"
import { User, UserParams, UserResponse } from "app/types"
import { AppStore, userActions } from "app/store"
import { ApiCache, debug } from "app/helpers"
import { ServiceBase, ServiceProps } from "app/services/ServiceBase"

export class UserService extends ServiceBase {
  static USER_CACHE_MAX_AGE = 1000 * 60 * 30
  static USER_SEARCH_CACHE_MAX_AGE = 1000 * 60 * 60 * 24

  getUser: (userId: number) => Promise<User>
  getUserIdsByName: (name: string, options: UserParams) => Promise<number[]>
  getMe: () => Promise<User>

  private userCache!: ApiCache<number, User>
  private _setUserCache(
    initialCache: Entry<number, User>[],
    setCacheAction: (cache: LRUCache<number, User>) => void
  ) {
    this.userCache = new ApiCache<number, User>({
      cache: initialCache,
      max: 60,
      maxAge: UserService.USER_CACHE_MAX_AGE,
      onGet: () => debug.cache("cache hit"),
      onSet: (k, v, cache) => setCacheAction(cache),
    })

    return this.userCache
  }

  private userSearchCache!: ApiCache<string, number[]>
  private _setUserSearchCache(
    initialCache: Entry<string, number[]>[],
    setCacheAction: (cache: LRUCache<string, number[]>) => void
  ) {
    this.userSearchCache = new ApiCache<string, number[]>({
      cache: initialCache,
      max: 500,
      maxAge: UserService.USER_SEARCH_CACHE_MAX_AGE,
      keyResolver: (k, userIds, isPromisePending) => {
        if (isPromisePending) {
          return true
        }
        const cache = this.userCache
        const dump = cache.dumpRaw()

        dump.forEach((e) => {
          if (userIds?.includes(e.k) && cache.isStale(e)) {
            cache.set(e.k, e.v) // update expire time
          }
        })
        return userIds?.every((id) => cache.has(id)) || false
      },
      onGet: () => debug.cache("cache hit"),
      onSet: (k, v, cache) => setCacheAction(cache),
    })

    return this.userSearchCache
  }

  constructor(props: ServiceProps) {
    super(props)
    const { store } = props
    const { user } = store.getState()
    const userCache = this._setUserCache(user.cache, (cache) =>
      store.dispatch(userActions.setUserCache(cache.dump()))
    )
    const userSearchCache = this._setUserSearchCache(
      user.userSearchCache,
      (cache) => store.dispatch(userActions.setUserSearchCache(cache.dump()))
    )

    this.getUser = this._memoizeApi(this._getUserRaw, userCache)
    this.getMe = this._memoizeApi(this._getMeRaw, userCache)
    this.getUserIdsByName = this._memoizeApi(
      this._getUserIdsByNameRaw,
      userSearchCache
    )
  }

  private _memoizeApi = <
    K extends string | number,
    V,
    F extends (...args) => any
  >(
    fn: F,
    cache: ApiCache<K, V>
  ): F => {
    const memoizedCb = memoize(fn)
    memoizedCb.cache = cache
    return memoizedCb
  }

  private _getMeRaw = () => {
    return this.API.get<UserResponse>("me").then(
      (response) => response.data.items![0]
    )
  }

  private _getUserRaw = (userId: number) => {
    return this.API.get<UserResponse>("users/" + userId).then(
      (response) => response.data.items![0]
    )
  }

  private _getUserIdsByNameRaw = (name: string, options: UserParams = {}) => {
    const { sort = "reputation", order = "desc", min, max, pagesize } = options
    const params = { inname: name.trim(), sort, order, min, max, pagesize }

    return this.API.get<UserResponse>("users", { params }).then((response) => {
      const users = response.data.items!
      this.userCache.setMany(users.map((u) => [u.user_id, u]))
      return users.map((u) => u.user_id)
    })
  }

  getUsersByName = (name: string, options: UserParams = {}) => {
    return this.getUserIdsByName(name, options).then((userIds: number[]) =>
      userIds
        .map((id) => this.userCache.getValue(id))
        .filter((u): u is User => !!u)
    )
  }
}
