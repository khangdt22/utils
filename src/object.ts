import { isNull, notNullish } from './condition'
import type { Nullable } from './types'
import { sum } from './array'

export type AnyObject = Record<PropertyKey, any>

export type PickByType<T, Value> = {
    [P in keyof T as T[P] extends Value | undefined ? P : never]: T[P]
}

export function isObject(input: any): input is AnyObject {
    return !isNull(input) && typeof input === 'object' && !Array.isArray(input)
}

export function isKeyOf<T extends AnyObject>(obj: T, name: PropertyKey): name is keyof T {
    return name in obj
}

export function isKeysOf<T extends string>(data: AnyObject, keys: T[]): data is Record<T, unknown> {
    return keys.every((key) => isKeyOf(data, key))
}

export function hasOwnProperty<T extends AnyObject>(obj: T, name: PropertyKey): name is keyof T {
    return Object.hasOwn(obj, name)
}

export function keys<T extends AnyObject>(obj: T) {
    return Object.keys(obj) as Array<`${keyof T & (string | number | boolean | null | undefined)}`>
}

export function entries<O extends AnyObject>(obj: O) {
    return Object.entries(obj) as Array<[keyof O, O[keyof O]]>
}

export type FilterPredicate<O, K extends keyof O> = (key: K, value: O[K], index: number) => boolean

export function filter<O extends AnyObject>(obj: O, predicate: FilterPredicate<O, keyof O>) {
    return Object.fromEntries(entries(obj).filter(([key, value], index) => predicate(key, value, index)))
}

export function filterByValue<O extends AnyObject>(obj: O, predicate: (value: O[keyof O]) => boolean) {
    return filter(obj, (_, value) => predicate(value))
}

export function pick<O extends AnyObject, K extends keyof O>(obj: O, ...keys: K[]) {
    return filter(obj, (key) => keys.includes(key as K)) as Pick<O, K>
}

export function omit<O extends AnyObject, K extends keyof O>(object: O, ...keys: K[]) {
    return filter(object, (key) => !keys.includes(key as K)) as Omit<O, K>
}

// eslint-disable-next-line max-len
export function map<K extends PropertyKey, V, NK extends PropertyKey, NV>(obj: Record<K, V>, fn: (k: K, v: V, i: number) => Nullable<[NK, NV]>) {
    return Object.fromEntries(entries(obj).map(([k, v], i) => fn(k, v, i)).filter(notNullish))
}

export function sumBy<O extends AnyObject>(objects: O[], key: keyof PickByType<O, number>) {
    return sum(objects.map((o) => o[key]))
}
