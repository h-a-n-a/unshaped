import React, { FC, useRef, useState, useCallback, createContext } from 'react'

import Container from './container'
import Executor from './Executor'
import { EMPTY } from './constants'
import { Store } from './types'
import { isDev } from './utils'

export type Hook<T, U> = (props: T) => U

function createStore<T, U>(hook: Hook<T, U>): Store<T, U> {
  const Ctx = createContext<Container<U> | typeof EMPTY>(EMPTY)

  const Provider: FC<T> = ({ children, ...params }) => {
    const containerRef = useRef<Container<U>>(new Container<U>())
    const container = containerRef.current

    const [hasExecutorMounted, setHasExecutorMounted] = useState(false)
    const onChange = useCallback((data: U) => {
      if (!hasExecutorMounted) setHasExecutorMounted(true)
      container.data = data
      container.notify()
    }, [])

    return (
      <Ctx.Provider value={container}>
        <Executor hook={hook} hookProps={params} onChange={onChange} />
        {hasExecutorMounted && children}
      </Ctx.Provider>
    )
  }

  if (isDev) {
    Provider.displayName = `${hook.name}.Provider`
  }

  return {
    Provider,
    Context: Ctx
  }
}

export default createStore
