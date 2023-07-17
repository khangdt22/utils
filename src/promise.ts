import type { Fn } from './function'
import { sleep } from './time'

export type Awaitable<T> = T | PromiseLike<T>

export function createEmptyPromise<T>() {
    let resolveFn: (value?: T | PromiseLike<T>) => void
    let rejectFn: (reason?: any) => void

    const promise = new Promise<T | undefined>((resolve, reject) => {
        resolveFn = resolve
        rejectFn = reject
    })

    return Object.assign(promise, { resolve: resolveFn!, reject: rejectFn! })
}

export const poll = (fn: Fn, delay = 0, immediately = true) => {
    let active = true

    const stop = () => (active = false)

    const watch = async () => {
        if (!active) {
            return
        }

        await Promise.resolve(fn()).catch((error) => {
            throw error
        })

        await sleep(delay)
        await watch()
    }

    setTimeout(watch, immediately ? 0 : delay)

    return stop
}

export interface RetryOptions {
    delay?: number
    maxAttempts?: number
}

export function retry<T extends Fn>(fn: T, options: RetryOptions = {}): Promise<ReturnType<T>> {
    const { delay = 0, maxAttempts = 3 } = options

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
