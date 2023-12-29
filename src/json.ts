import JSON5 from 'json5'
import { isBigInt } from './number'
import { isObject } from './object'
import { wrap } from './array'

export type ParseReviver = Parameters<typeof JSON5.parse>[1]

export type StringifyReplacer = (key: string, value: any) => any

export type StringifyOptions = Omit<Parameters<typeof JSON5.stringify>[1], 'replacer' | 'space'> & {
    replacer?: StringifyReplacer | StringifyReplacer[]
    space?: string | number
    json5?: boolean
}

export const bigIntSerialize: StringifyReplacer = (_, value) => {
    return isBigInt(value) ? { type: 'bigint', value: value.toString() } : value
}

export const bigIntDeserialize: ParseReviver = (_, value) => {
    if (isObject(value) && 'type' in value && 'value' in value && value.type === 'bigint') {
        return BigInt(value.value)
    }

    return value
}

export function parse(data: string, reviver: ParseReviver | ParseReviver[] = bigIntDeserialize) {
    const revivers = wrap(reviver)

    return JSON5.parse(data, (key, value) => {
        for (const rv of revivers) {
            value = rv ? rv(key, value) : value
        }

        return value
    })
}

export function stringify(data: any, options: StringifyOptions = {}) {
    const { replacer = bigIntSerialize, json5 = false, ...rest } = options
    const replacers = Array.isArray(replacer) ? replacer : [replacer]

    const rpl = (key: string, value: any) => {
        for (const r of replacers) {
            value = r ? r(key, value) : value
        }

        return value
    }

    if (json5) {
        return JSON5.stringify(data, { ...rest, replacer: rpl })
    }

    return JSON.stringify(data, rpl, rest.space)
}
