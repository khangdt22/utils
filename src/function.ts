import type { Nullable } from './types'

export type Fn = (...args: any[]) => any

export type Args<F extends Fn> = F extends (...args: infer A) => any ? A : never

export const isFunction = <T extends Fn>(value: unknown): value is T => typeof value === 'function'

export const noop = () => {}

export function invoke(fn: Fn) {
    return fn()
}

export function batchInvoke(functions: Array<Nullable<Fn>>) {
    for (const fn of functions) {
        fn?.()
    }
}

export function tap<T>(value: T, callback: (value: T) => void): T {
    callback(value)

    return value
}
