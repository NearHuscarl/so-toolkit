import LRU from "lru-cache";
import { isPromise } from "app/helpers/index";

interface IMapCache<K, V> {
  clear(): void;
  delete(key: K): boolean;
  get(key: K): V | undefined;
  has(key: K): boolean;
  set(key: K, value: V): IMapCache<K, V>;
}

type OnCacheCallback<K, V> = (k: K, v: V, cache: LRU<K, V>) => void;
type CacheSettings<K, V> = {
  onSet?: OnCacheCallback<K, V>;
  onGet?: OnCacheCallback<K, V>;
  cache?: LRU.Entry<K, V>[];
};

// copied from https://stackoverflow.com/a/30112075/9449426
// but only implement methods required by lodash.memoize.Cache
// See: https://lodash.com/docs/#memoize
export class ApiCache<K extends string | number, V extends any>
  implements IMapCache<K, V> {
  private _cache = new LRU<K, V>({
    max: 30,
    maxAge: 1000 * 60 * 10,
  });
  private readonly onSet?: OnCacheCallback<K, V>;
  private readonly onGet?: OnCacheCallback<K, V>;

  constructor(settings: CacheSettings<K, V> = {}) {
    const { onSet, onGet, cache } = settings;
    this.onSet = onSet;
    this.onGet = onGet;

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
      this.onGet && this.onGet(key, hit, this._cache);
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
