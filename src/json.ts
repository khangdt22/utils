import JSON5 from 'json5'
import { isBigInt } from './number'
import { isObject } from './object'

export type ParseReviver = Parameters<typeof JSON5.parse>[1]

export type StringifyOptions = Parameters<typeof JSON5.stringify>[1]

export const bigIntSerialize: StringifyOptions['replacer'] = (_, value) => {
    return isBigInt(value) ? { type: 'bigint', value: value.toString() } : value
}

export const bigIntDeserialize: ParseReviver = (_, value) => {
    if (isObject(value) && 'type' in value && 'value' in value && value.type === 'bigint') {
        return BigInt(value.value)
    }

    return value
}

export function parse(data: string, reviver: ParseReviver = bigIntDeserialize) {
    return JSON5.parse(data, reviver)
}

export function stringify(data: any, options: StringifyOptions = {}) {
    if (!options.replacer) {
        options.replacer = bigIntSerialize
    }

    return JSON5.stringify(data, options)
}
