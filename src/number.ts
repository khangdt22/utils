import { isString } from './string'

let id = 0

export const uniqueId = () => ++id

export type Numberish = string | number | bigint

export const isNumber = (value: unknown): value is number => typeof value === 'number'

export const isBigInt = (value: unknown): value is bigint => typeof value === 'bigint'

export const isNumberString = (value: string) => /^([+-])?(\d+)(\.\d+)?$/.test(value)

export function isNumberish(input: unknown): input is Numberish {
    return isNumber(input) || isBigInt(input) || (isString(input) && isNumberString(input))
}

export function random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export function toBigInt(input: unknown) {
    return BigInt(String(input))
}

export function toNumber(input: unknown) {
    return Number(String(input))
}

export const bigIntMin = (...args: bigint[]) => args.reduce((m, e) => (e < m ? e : m))

export const bigIntMax = (...args: bigint[]) => args.reduce((m, e) => (e > m ? e : m))

export const bigIntAbs = (value: bigint) => (value < 0n ? -value : value)

export interface FormatOptions extends Intl.NumberFormatOptions {
    locales?: string | string[]
    groupFractionLeadingZeros?: boolean
    exactFractionWhenZero?: boolean
    maximumFractionLeadingZeros?: number
}

export function format(number: Numberish, options: FormatOptions = {}) {
    let leadingZerosCount = 0
    let { maximumFractionDigits = 4, groupFractionLeadingZeros = false } = options

    const { exactFractionWhenZero = true, maximumFractionLeadingZeros = maximumFractionDigits } = options
    const [integerPart, fractionPart = '0'] = String(number).split('.')

    if (BigInt(integerPart) == 0n && (groupFractionLeadingZeros || exactFractionWhenZero)) {
        maximumFractionDigits += leadingZerosCount = RegExp(/^0+/).exec(fractionPart)?.[0].length ?? 0

        if (!groupFractionLeadingZeros) {
            leadingZerosCount = 0
        }
    }

    const formatter = new Intl.NumberFormat(options.locales, { ...options, maximumFractionDigits })

    if (leadingZerosCount > maximumFractionLeadingZeros) {
        const formatted = formatter.formatToParts(number as number).map((part) => {
            if (part.type == 'fraction') {
                part.value = `0{${leadingZerosCount}}` + part.value.slice(Math.max(0, leadingZerosCount))
            }

            return part.value
        })

        return formatted.join('')
    }

    return formatter.format(number as number)
}
