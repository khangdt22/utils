export type ElementOf<T> = T extends Array<infer E> ? E : never

export type NonEmptyArray<T = any> = [T, ...T[]]

export type Tuple<T, S extends number, R extends readonly T[] = []> = R['length'] extends S ? R : Tuple<T, S, readonly [T, ...R]>

export function common<T>(...arrays: T[][]): T[] {
    return arrays.reduce((r, v) => r.filter((i) => v.includes(i)))
}

export function chunk<T>(array: T[], size: number) {
    const result: T[][] = []

    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size))
    }

    return result
}

export function unique<T>(array: T[]) {
    return [...new Set(array)]
}

export function uniqueBy<T>(array: T[], equalFn: (a: T, b: T) => boolean) {
    return array.filter((v, i, arr) => arr.findIndex((x) => equalFn(v, x)) === i)
}

export function wrap<T>(array: T | T[]): T[] {
    return Array.isArray(array) ? array : [array]
}

export function sum(array: number[]): number {
    return array.reduce((a, b) => a + b, 0)
}

export function sumBigint(array: bigint[]): bigint {
    return array.reduce((a, b) => a + b, 0n)
}

export function last(array: []): undefined

export function last<T>(array: T[]): T

export function last<T>(array: T[]): T | undefined {
    return array.at(-1)
}

export function shuffle<T>(input: T[]): T[] {
    const array = [...input]

    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]
    }

    return array
}
