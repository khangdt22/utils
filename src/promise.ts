import type { Fn } from './function'
import { sleep } from './time'

export type Awaitable<T> = T | PromiseLike<T>

export function createDeferred<T>() {
    let resolveFn: (value: Awaitable<T>) => void = () => void 0
    let rejectFn: (reason?: any) => void = () => void 0

    const promise = new Promise<T>((resolve, reject) => {
        resolveFn = resolve
        rejectFn = reject
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

export function retry<T extends Fn>(fn: T, maxAttempts = 3, delay = 0): Promise<ReturnType<T>> {
    let attempts = 0

    const run = async () => {
        try {
            return fn()
        } catch (error) {
            attempts++

            if (attempts >= maxAttempts) {
                throw error
            }

            await sleep(delay)

            return run()
        }
    }

    return run()
}

export function timeout<T>(promise: Promise<T>, ms: number, message?: string): Promise<T> {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => reject(new Error(message ?? `Promise timed out after ${ms} ms`)), ms)

        promise.then(resolve).catch(reject).finally(() => {
            clearTimeout(timeoutId)
        })
    })
}
