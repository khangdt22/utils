import { ensurePrefix, hasPrefix, isString, stripPrefix } from './string'

export type Hex = `0x${string}`

export function isHexString(value: unknown, length?: number): value is string {
    return isString(value) && RegExp(`^(?:0x)?[0-9a-f]${length ? '{' + length + '}' : '+'}$`, 'iu').test(value)
}

export function isStrictHexString(value: unknown, length?: number): value is Hex {
    return isString(value) && hasPrefix(value, '0x') && isHexString(value, length)
}

export function stripHexPrefix(value: string): string {
    return stripPrefix(value, '0x')
}

export function ensureHexPrefix(value: string) {
    return ensurePrefix(value, '0x') as Hex
}
