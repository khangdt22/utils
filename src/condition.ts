import type { Nullable } from './types'
import { isString } from './string'
import { isObject } from './object'

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

export function isEmpty(value: unknown) {
    if (isString(value) || Array.isArray(value)) {
        return value.length === 0
    }

    if (isObject(value)) {
        return Object.keys(value).length === 0
    }

    return !value && value !== 0 && value !== false
}

export function isTrue(value: unknown): value is true {
    if (isBoolean(value)) {
        return value
    }

    if (isString(value)) {
        return ['true', 't', 'yes', 'y', 'on', '1'].includes(value.trim().toLowerCase())
    }

    return value === 1 || value === 1n
}
