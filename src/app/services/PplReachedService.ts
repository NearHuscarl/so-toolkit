import memoize from "lodash/memoize"
import { PeopleReached } from "app/types"
import { userActions } from "app/store"
import { ApiCache, debug } from "app/helpers"
import LRUCache, { Entry } from "lru-cache"
import { ServiceBase, ServiceProps } from "app/services/ServiceBase"

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
      onGet: () => debug.cache("cache hit"),
      onSet: (k, v, cache) => setCacheAction(cache),
    })

    return this.cache
  }

  constructor(props: ServiceProps) {
    super({
      api: props.api,
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
    const body = new URLSearchParams(`UserID=${userId}`)
    const url = "/query/run/1/1313875/1615550"

    return this.API.post<PeopleReached>(url, body).then(
      (response) => response.data
    )
  }
}

export function computePeopleReached() {}
