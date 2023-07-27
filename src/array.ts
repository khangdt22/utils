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

export function wrap<T>(array: T | T[]): T[] {
    return Array.isArray(array) ? array : [array]
}

export function sum(array: number[]): number {
    return array.reduce((a, b) => a + b, 0)
}

export function sumBigint(array: bigint[]): bigint {
    return array.reduce((a, b) => a + b, 0n)
}
