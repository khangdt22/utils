import type { Nullable } from './types'

export function assert(condition: boolean, message: string | Error): asserts condition {
    if (!condition) {
        if (message instanceof Error) {
            throw message
        }

        throw new Error(message)
    }
}

export const isNull = (value: unknown): value is null => value === null

export const notNull = <T>(value: T | null): value is Exclude<T, null> => !isNull(value)

export const isUndefined = (value: unknown): value is undefined => value === undefined

export const notUndefined = <T>(value: T | undefined): value is Exclude<T, undefined> => !isUndefined(value)

export const isNullish = (value: unknown): value is null | undefined => isNull(value) || isUndefined(value)

export const notNullish = <T>(value: Nullable<T>): value is NonNullable<T> => !isNullish(value)

export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'
