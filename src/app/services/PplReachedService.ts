import axios from "axios"
import memoize from "lodash/memoize"
import Debug from "debug"
import { PeopleReached } from "app/types"
import { userActions } from "app/store"
import { ApiCache } from "app/helpers"
import LRUCache, { Entry } from "lru-cache"
import { ServiceBase, ServiceProps } from "app/services/ServiceBase"
import { SEDE_AUTH_URL } from "app/constants"

const debug = Debug("app:cache")

export class PplReachedService extends ServiceBase {
  // TODO: add firebase cache
  static CACHE_MAX_AGE = 1000 * 60 * 60 * 24

  get: (userId: number) => Promise<PeopleReached>

  private cache!: ApiCache<number, PeopleReached>

  private _setCache(
    initialCache: Entry<number, PeopleReached>[],
    setCacheAction: (cache: LRUCache<number, PeopleReached>) => void
  ) {
    this.cache = new ApiCache<number, PeopleReached>({
      cache: initialCache,
      max: 120,
      maxAge: PplReachedService.CACHE_MAX_AGE,
      onGet: () => debug("cache hit"),
      onSet: (k, v, cache) => setCacheAction(cache),
    })

    return this.cache
  }

  constructor(props: ServiceProps) {
    super({
      api: axios.create({ baseURL: SEDE_AUTH_URL }),
      store: props.store,
    })
    const { store } = props
    const { user } = store.getState()
    const cache = this._setCache(
      user.cache,
      (cache) =>
        // TODO: cache
        // store.dispatch(userActions.setUserCache(cache.dump()))
        void 0
    )

    this.store = store
    this.get = this._memoizeApi(this._getRaw, cache)
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
    // TODO: cache
    // memoizedCb.cache = cache
    return memoizedCb
  }

  private _getRaw = (userId: number) => {
    const { authCookie } = this.store.getState().auth
    const headers = { "auth-cookie": authCookie }
    const body = new URLSearchParams(`UserID=${userId}`)
    const url = "/query/run/1/1313875/1615550"

    return this.API.post<PeopleReached>(url, body, { headers }).then(
      (response) => response.data
    )
  }
}

export function computePeopleReached() {}
