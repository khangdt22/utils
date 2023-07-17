import type { Args, Fn } from './function'

export type Constructor<T> = new (...args: any[]) => T

export type MethodArgs<C, M extends keyof C> = C[M] extends Fn ? Args<C[M]> : never

export type MethodReturnType<C, M extends keyof C> = C[M] extends Fn ? ReturnType<C[M]> : never
