import LRU from "lru-cache";
import { isPromise } from "app/helpers/index";

interface IMapCache<K, V> {
  clear(): void;
  delete(key: K): boolean;
  get(key: K): Promise<V | undefined>;
  has(key: K): boolean;
  set(key: K, value: V | Promise<V>): IMapCache<K, V>;
}

type OnCacheCallback<K, V> = (k: K, v: V, cache: LRU<K, V>) => void;
type KeyResolver<K, V> = (k: K, v: V | undefined, cache: LRU<K, V>) => boolean;
type CacheSettings<K, V> = {
  onSet?: OnCacheCallback<K, V>;
  onGet?: OnCacheCallback<K, V>;
  // extra resolver for key, useful when one cache depend on another one
  keyResolver?: KeyResolver<K, V>;
  cache?: LRU.Entry<K, V>[];
  max?: number;
  maxAge?: number;
};

// copied from https://stackoverflow.com/a/30112075/9449426
// but only implement methods required by lodash.memoize.Cache
// See: https://lodash.com/docs/#memoize
export class ApiCache<K extends string | number, V extends any>
  implements IMapCache<K, V> {
  private readonly _cache: LRU<K, V>;
  private readonly onSet?: OnCacheCallback<K, V>;
  private readonly onGet?: OnCacheCallback<K, V>;
  private readonly keyResolver?: KeyResolver<K, V>;

  constructor(settings: CacheSettings<K, V> = {}) {
    const {
      onSet,
      onGet,
      keyResolver,
      cache,
      max = 60,
      maxAge = 1000 * 60 * 30,
    } = settings;

    this.onSet = onSet;
    this.onGet = onGet;
    this.keyResolver = keyResolver;
    this._cache = new LRU<K, V>({ max, maxAge });
    this._set = this._set.bind(this); // _set will be passed around in callback

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

  private static _getValue(value: any, directValue: boolean) {
    return directValue ? value : Promise.resolve(value);
  }

  private _get(key: K, directValue: boolean) {
    const hit = this._cache.get(key);

    if (hit !== undefined) {
      if (this.keyResolver && !this.keyResolver(key, hit, this._cache)) {
        return ApiCache._getValue(undefined, directValue);
      }
      this.onGet && this.onGet(key, hit, this._cache);
    }

    return ApiCache._getValue(hit, directValue);
  }

  get(key: K): Promise<V | undefined> {
    return this._get(key, false);
  }

  getValue(key: K): V | undefined {
    return this._get(key, true);
  }

  has(key: K): boolean {
    if (this.keyResolver) {
      return this.keyResolver(key, this.getValue(key), this._cache);
    }
    return this._cache.has(key);
  }

  private _set(key: K, value: V) {
    const result = this._cache.set(key, value);

    if (result) {
      this.onSet && this.onSet(key, value, this._cache);
    }
  }

  set(key: K, value: V | Promise<V>): IMapCache<K, V> {
    if (isPromise(value)) {
      value.then((v) => this._set(key, v));
    } else {
      this._set(key, value);
    }
    return this;
  }
}
