/* eslint-disable @typescript-eslint/no-explicit-any */
import type {Inputs, StateUpdater} from 'preact/hooks'
import {useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState} from 'react'

export {useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState}

/**
 * useClickAway: Triggers a callback when user clicks outside the target element.
 * Ex. useClickAway(ref, callback);
 */
export function useClickAway<E extends Event = Event>(
  ref: React.MutableRefObject<HTMLElement | null>,
  onDismiss: (event: E) => void,
  events: string[] = useClickAway.defaultEvents
) {
  const savedCallback = useRef(onDismiss)
  useEffect(() => {
    savedCallback.current = onDismiss
  }, [onDismiss])
  useEffect(() => {
    const handler = (event: any) => {
      const {current: el} = ref
      el && !el.contains(event.target) && savedCallback.current(event)
    }
    for (const eventName of events) {
      document.addEventListener(eventName, handler)
    }
    return () => {
      for (const eventName of events) {
        document.removeEventListener(eventName, handler)
      }
    }
  }, [events, ref])
}
useClickAway.defaultEvents = ['mousedown', 'touchstart']

/**
 * useEvent: subscribes a handler to window events.
 * Ex. useEvent('keydown', callback); (also see useKey)
 */
export const useEvent: UseEvent = (type, listener, options) => {
  useEffect(() => {
    addEventListener(type as any, listener, options)
    return () => {
      removeEventListener(type as any, listener, options)
    }
  }, [type, listener, JSON.stringify(options)])
}
type UseEvent = <K extends string | keyof WindowEventMap>(
  type: UseEventsProps<K>['type'],
  listener: UseEventsProps<K>['listener'],
  options?: UseEventsProps<K>['options']
) => void
type UseEventsProps<K extends string | keyof WindowEventMap> = {
  type: K
  listener: (this: Window, ev: K extends keyof WindowEventMap ? WindowEventMap[K] : any) => any
  options?: boolean | AddEventListenerOptions
}

/**
 * executes a handler when a keyboard key is used.
 * Ex. useKey('ArrowUp', callback);
 */
export function useKey(key: KeyFilter, fn: Handler = () => {}, opts: UseKeyOptions = {}, deps: Inputs = [key]) {
  const {event = 'keydown', ...optsNoEvent} = opts
  const useMemoHandler = useMemo(() => {
    const predicate: KeyPredicate = useKey.createKeyPredicate(key)
    const handler: Handler = handlerEvent => {
      if (predicate(handlerEvent)) return fn(handlerEvent)
    }
    return handler
  }, deps)
  useEvent(event, useMemoHandler, optsNoEvent)
}
useKey.codes = {
  Esc: 27,
}
useKey.createKeyPredicate = (keyFilter: KeyFilter): KeyPredicate =>
  typeof keyFilter === 'function'
    ? keyFilter
    : typeof keyFilter === 'string'
    ? (event: KeyboardEvent) => event.key === keyFilter
    : keyFilter
    ? () => true
    : () => false
export type KeyPredicate = (event: KeyboardEvent) => boolean
export type KeyFilter = null | undefined | string | number | ((event: KeyboardEvent) => boolean)
export type Handler = (event: KeyboardEvent) => void
export interface UseKeyOptions extends AddEventListenerOptions {
  event?: 'keydown' | 'keypress' | 'keyup'
}

/**
 * useEffectDeep: Like useEffect, but does a deep compare instead default compare
 * to avoid misfires
 */
export function useEffectDeep(callback: Fnc, varsToWatch: any[]) {
  const lastSeenProps = useRef<Inputs[]>([])
  useEffect(watchProps, varsToWatch)

  function watchProps() {
    if (Object.isNotEqual(varsToWatch, lastSeenProps.current)) {
      lastSeenProps.current = varsToWatch
      return callback()
    }
  }
}

/**
 * useFirstMountState: check if current render is first.
 * from react-use
 */
export function useFirstMountState(): boolean {
  const isFirst = useRef(true)
  if (isFirst.current) {
    isFirst.current = false
    return true
  }
  return isFirst.current
}

/**
 * useForceUpdate: returns a callback, which re-renders component when called
 * from react-use's useUpdate
 */
export const useForceUpdate = useUpdate

/**
 * useInterval: Call callback cb every ms milliseconds after mount
 * @param cb - callback to call after timeout
 * @param ms - milliseconds to wait before calling cb after mount
 * @param cancelOnDismount - whether to cancel on dismount
 */
export function useInterval(cb: () => any, ms = 0, cancelOnDismount = true) {
  useEffect(() => {
    const interval = setInterval(cb, ms)
    return () => {
      if (cancelOnDismount) clearInterval(interval)
    }
  }, [])
}

/**
 * useLayoutEffectDeep: Like useLayoutEffect, but does a deep compare instead default compare
 * to avoid misfires
 */
export function useLayoutEffectDeep(callback: Fnc, varsToWatch: any[]) {
  const lastSeenProps = useRef<Inputs[]>([])
  useLayoutEffect(watchProps, varsToWatch)

  function watchProps() {
    if (Object.isNotEqual(varsToWatch, lastSeenProps.current)) {
      lastSeenProps.current = varsToWatch
      return callback()
    }
  }
}

/**
 * useMount: Call callback cb after mount. Does nothing with return result
 */
export const useMount = (fn: () => any) => {
  useEffect(() => {
    fn()
  }, [])
}

/**
 * useMount: Call callback cb on unmount
 */
export const useUnmount = (fn: () => any) => {
  useEffect(() => fn, [])
}

/**
 * useMountedState: returns a fcn that returns true if component is mounted.
 * from react-use
 */
export function useMountedState() {
  const isMountedRef = useRef(true)
  const isMounted = useCallback(() => isMountedRef.current, [])
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])
  return isMounted
}

/**
 * A hook that watches a css media breakpoint
 *
 * e.g. isWide = useMedia('(min-width: 768px)')
 */
export function useMedia(query: string) {
  const [state, setState] = useState(matchMedia(query).matches)
  useEffect(() => {
    let mounted = true
    const mql = matchMedia(query)
    const onChange = () => mounted && setState(!!mql.matches)
    mql.addEventListener('change', onChange)
    setState(mql.matches)
    return () => {
      mounted = false
      mql.removeEventListener('change', onChange)
    }
  }, [query])
  return state
}

/**
 * useEffectDeep: Like useEffect, but does a deep compare instead default compare
 * to avoid misfires
 */
export function useMemoDeep(callback: Fnc, varsToWatch: any[]) {
  const [lastSeenProps, setLastSeenProps] = useState(varsToWatch)
  useEffect(watchProps, varsToWatch)
  return useMemo(callback, [lastSeenProps])

  function watchProps() {
    if (Object.isNotEqual(varsToWatch, lastSeenProps)) setLastSeenProps(varsToWatch)
  }
}

/**
 * Use a stateful Set as if it were almost a normal Set, with helpers like toggle and reset.
 */
export interface UseSet<T> {
  current: Set<T>
  size: number
  has(v: T): boolean
  add(v: T): void
  delete(v: T): void
  toggle(v: T): void
  clear(): void
  reset(): void
  set: StateUpdater<Set<T>>
}
export function useSet<T>(initial: Set<T> = new Set()) {
  const [set, setSet] = useState(initial)
  const has: UseSet<T>['has'] = v => set.has(v)
  const add: UseSet<T>['add'] = useCallback(
    v =>
      setSet(curr => {
        curr.add(v)
        return new Set([...curr])
      }),
    []
  )
  const del: UseSet<T>['delete'] = useCallback(
    v =>
      setSet(curr => {
        curr.delete(v)
        return new Set([...curr])
      }),
    []
  )
  const toggle: UseSet<T>['toggle'] = useCallback(
    v =>
      setSet(curr => {
        if (curr.has(v)) curr.delete(v)
        else curr.add(v)
        return new Set([...curr])
      }),
    []
  )
  const clear: UseSet<T>['clear'] = useCallback(() => setSet(new Set<T>()), [])
  const reset: UseSet<T>['reset'] = useCallback(() => setSet(new Set([...initial])), [])
  const res: UseSet<T> = {
    current: set,
    size: set.size,
    has,
    add,
    delete: del,
    toggle,
    clear,
    reset,
    set: setSet,
  }
  return res
}

/**
 * useTimeout: Call callback cb after ms milliseconds after mount
 * @param cb - callback to call after timeout
 * @param ms - milliseconds to wait before calling cb after mount
 * @param cancelOnDismount - whether to cancel on dismount
 */
export function useTimeout(cb: () => any, ms = 0, cancelOnDismount = true) {
  useEffect(() => {
    const timeout = setTimeout(cb, ms)
    return () => {
      if (cancelOnDismount) clearTimeout(timeout)
    }
  }, [])
}

/**
 * useUpdate: returns a callback, which re-renders component when called
 * @param ms - if supplied, will automatically re-render after ms milliseconds
 */
export function useUpdate(ms = 0) {
  const updateReducer = (num: number): number => (num + 1) % 1_000_000
  const [, update] = useReducer(updateReducer, 0)
  useTimeout(() => {
    if (ms) (update as () => void)()
  }, ms)
  return update as () => void
}

/**
 * useUpdateEffect: run an effect only on updates.
 * based on react-use
 */
export const useUpdateEffect: typeof useEffect = (effect, deps) => {
  const isFirstMount = useFirstMountState()
  useEffect(() => {
    if (!isFirstMount) {
      return effect()
    }
  }, deps)
}
