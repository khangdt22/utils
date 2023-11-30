import pRetry, { type Options } from 'p-retry'
import type { Fn } from './function'
import { sleep } from './time'

export type Awaitable<T> = T | PromiseLike<T>

export function createDeferred<T>() {
    let resolveFn: (value: Awaitable<T>) => void = () => void 0
    let rejectFn: (reason?: any) => void = () => void 0

    const promise = <Promise<T> & { isSettled: boolean }>new Promise<T>((resolve, reject) => {
        resolveFn = resolve
        rejectFn = reject
    })

    promise.isSettled = false

    promise.finally(() => {
        promise.isSettled = true
    })

    return Object.assign(promise, { resolve: resolveFn, reject: rejectFn })
}

export const poll = (fn: Fn, delay = 0, immediately = true) => {
    let active = true

    const stop = () => (active = false)

    const watch = async () => {
        if (!active) {
            return
        }

        await fn()

        if (active) {
            await sleep(delay)
        }

        await watch()
    }

    setTimeout(watch, immediately ? 0 : delay)

    return stop
}

export type RetryOptions = Options & {
    delay?: number
}

export function withRetry<T extends Fn>(fn: T, maxAttempts?: number, delay?: number): Promise<ReturnType<T>>

export function withRetry<T extends Fn>(fn: T, options?: RetryOptions): Promise<ReturnType<T>>

// eslint-disable-next-line max-len
export function withRetry<T extends Fn>(fn: T, params: RetryOptions | number = {}, delay?: number): Promise<ReturnType<T>> {
    const options: RetryOptions = typeof params === 'number' ? { retries: params, delay } : params

    return pRetry(fn, {
        ...options,
        onFailedAttempt: async (error) => {
            await sleep(options.delay ?? 0)
            await options.onFailedAttempt?.(error)
        },
    })
}

export function withTimeout<T>(promise: Promise<T>, ms: number, message?: Error | string): Promise<T> {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => reject(message instanceof Error ? message : new Error(message ?? `Promise timed out after ${ms} ms`)), ms)

        promise.then(resolve).catch(reject).finally(() => {
            clearTimeout(timeoutId)
        })
    })
}
