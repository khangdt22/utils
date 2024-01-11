export type Nullable<T> = T | null | undefined

export type ContainsType<T, U> = Extract<T, U> extends never ? false : true

export const toString = (value: unknown) => Object.prototype.toString.call(value)

export function typeOf(v: unknown) {
    if (v === null) {
        return 'null'
    }

    return typeof v === 'object' || typeof v === 'function' ? toString(v).slice(8, -1).toLowerCase() : typeof v
}
