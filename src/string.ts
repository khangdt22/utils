import { wrap } from './array'

export const isString = (value: unknown): value is string => typeof value === 'string'

export function ltrim(str: string, characters = ' \n\r\t\v') {
    let start = 0
    const end = str.length

    while (start < end && characters.includes(str[start])) {
        ++start
    }

    return start > 0 ? str.slice(start, end) : str
}

export function rtrim(str: string, characters = ' \n\r\t\v') {
    let end = str.length

    while (end > 0 && characters.includes(str[end - 1])) {
        --end
    }

    return end < str.length ? str.slice(0, Math.max(0, end)) : str
}

export function trim(str: string, characters = ' \n\r\t\v') {
    return ltrim(rtrim(str, characters), characters)
}

export function hasPrefix(str: string, prefix: string) {
    return str.startsWith(prefix)
}

export function hasSuffix(str: string, suffix: string) {
    return str.endsWith(suffix)
}

export function ensurePrefix(str: string, prefix: string) {
    return hasPrefix(str, prefix) ? str : prefix + str
}

export function ensureSuffix(str: string, suffix: string) {
    return hasSuffix(str, suffix) ? str : str + suffix
}

export function stripPrefix(str: string, prefix: string) {
    return hasPrefix(str, prefix) ? str.slice(prefix.length) : str
}

export function stripSuffix(str: string, suffix: string) {
    return hasSuffix(str, suffix) ? str.slice(0, -suffix.length) : str
}

export function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export function chunk(str: string, size: number): string[] {
    return str.split(new RegExp(`(.{${size}})`)).filter(Boolean)
}

export function includes(str: string, search: string | string[], type: 'any' | 'all' = 'all') {
    return wrap(search)[type === 'all' ? 'every' : 'some']((s) => str.includes(s))
}

export function equals(str: string, ...others: string[]) {
    return others.every((other) => str === other)
}

export function equalsIgnoreCase(str: string, ...others: string[]) {
    return others.every((other) => str.toLowerCase() === other.toLowerCase())
}
