/* eslint-disable require-jsdoc */
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 *
 * useSWR: a tiny (600B) async resolver that displays a cached version (if available) of the
 * callback until the callback resolves.
 *
 * Tiny: only 600 bytes when bundled with Vite
 *
 */

/** A generic promise */
type PromiseType = (...args: any[]) => Promise<any>
/** Gets the return type of a promise */
type ReturnTypeP<T extends PromiseType> = ThenArg<ReturnType<T>>
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T

/** The state of a fetcher */
export interface CacheVal<T extends PromiseType> {
  /** A Normal JS error that is populated on error */
  error?: Error
  /** Any outstanding promise for fetching new data */
  promise?: ReturnType<T>
  /** The last time this cache item was refreshed */
  t?: number
  /** The latest result from the fetcher */
  result?: ReturnTypeP<T>
}

/**
 * The value stored in the SWR state, which is returned by useSWR
 *
 * @param refresh - A callback that will refresh the UI, call the fetcher, and update cache
 */
interface State<T extends PromiseType> extends CacheVal<T> {
  /**
   * A boolean that is true if the fetcher is in-flight
   */
  loading: boolean
  /**
   * A callback that will refresh the UI, call the fetcher, and update cache
   *
   * @param props - props to pass to the callback. If not provided, the prior props will be re-used
   * @returns a promise of the next value of the fetcher
   */
  refresh: () => ReturnType<T>
}

/**
 * A safe stringify that removes circular references
 * ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value
 */
const stringify = (obj: any) => {
  const seen = new WeakSet()
  return JSON.stringify(obj, (_, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return
      }
      seen.add(value)
    }
    return value
  })
}

/**
 * A cache of all the promises that are in-flight. These do not serialize to localStorage so store seperately
 */
const promiseCache = new Map<string, Promise<PromiseType>>()

/**
 * A wrapper around localCache and pCache
 */
const cache = {
  get(key: string): CacheVal<any> | undefined {
    const hit = {promise: promiseCache.get(key)}
    const lsCacheVal = localStorage.getItem('swr:' + key)
    if (lsCacheVal) Object.assign(hit, JSON.parse(lsCacheVal))
    return hit
  },
  set(key: string, value: CacheVal<any>) {
    const {promise, ...rest} = value
    if (promise) promiseCache.set(key, promise)
    else {
      promiseCache.delete(key)
      localStorage.setItem('swr:' + key, stringify(rest))
    }
  },
}

/**
 * FIFO Garbage Collector
 *
 * Limit the cache size to 100 items, and remove the oldest items
 */
setInterval(() => {
  ;(Object.entries(localStorage) as [string, string][])
    .filter(([k]) => k.startsWith('swr:'))
    .map(([k, v]) => [k, JSON.parse(v)] as [string, CacheVal<any>])
    .sort((a, b) => (a[1]?.t || 0) + (b[1]?.t || 0)) // sort by last refresh time
    .slice(100) // grab elements 100+
    .forEach(([k]) => {
      promiseCache.delete(k)
      localStorage.removeItem(k)
    })
}, 60_000)

/**
 *
 * useSWR: an async resolver that displays a cached version (if available) of the
 * callback until the callback resolves.
 *
 * Benefits:
 * - Only 440 bytes (minified + gzipped)
 * - Shows cached data immediately and updates the UI when the callback resolves
 * - Deduplicates concurrent requests: runs the callback only once if duplicates are requested
 * - UX: no flickering, no waiting if cached, enables native scroll restoration
 *
 * @param fetcher - an async callback that returns data. *Data be JSONable*
 * @param props - initial props to pass to the callback (only if callback has arguments)
 * @param throtle - Throttle threshold in ms: time that the cache is deemed current, to avoid over re-fetching
 *
 * @returns SWR State
 *
 * @example
 * ```ts
 *  import useSWR from '@ulibs/swr'
 *  export function Planets() {
 *    const data = useSWR({
 *      fetcher: () => sw.Planets.getPage(Number(_page)),
 *      props: [page]
 *    })
 *    if (data.loading) return <p>Loading...</p>
 *    if (data.error) return <Error error={data.error} />
 *    return (<pre>{JSON.stringify(data.result, null, 2)}</pre>)
 *  }
 * ```
 */
function useSWR<T extends PromiseType>({
  fetcher,
  props,
  throttle = 3000,
}: {
  /** An async callback that returns data. *Data must be JSONable* */
  fetcher: T
  /** initial props to pass to the callback (only if callback has arguments) */
  props: any[]
  /** Throttle threshold in ms: time that the cache is deemed current, to avoid over re-fetching */
  throttle?: number
}): State<T> {
  const cacheKey = stringify(props) + fetcher.toString()
  const [state, setState] = useState<State<T>>(() => {
    const hit = cache.get(cacheKey)
    return {...hit, refresh, loading: !!hit?.promise}
  })

  function refresh(hardRefresh = true): ReturnType<T> {
    const hit = cache.get(cacheKey) as CacheVal<T>
    if (hit?.promise) {
      return hit.promise
    }
    if (!hardRefresh && hit?.result && hit?.t && Date.now() - hit.t < throttle) {
      // @ts-expect-error - TS doesn't like this, but it works
      return (async () => hit.result)()
    }

    const onUpdate = (res: CacheVal<T>) => {
      cache.set(cacheKey, res)
      setState({...res, refresh, loading: !!res?.promise})
    }

    // @ts-expect-error - TS is having a hard time infering fetcher return type for some reason
    hit.promise = fetcher()
      .then(r => {
        onUpdate({result: r, t: Date.now()})
        return r
      })
      .catch(e => {
        onUpdate({error: e, t: Date.now()})
        throw e
      })

    onUpdate(hit)

    return hit.promise as ReturnType<T>
  }

  useEffect(() => {
    refresh(false)
  }, [cacheKey])

  return state
}

export default useSWR
