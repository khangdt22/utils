import { existsSync } from 'node:fs'
import { z } from 'zod'
import { isHexString, isStrictHexString, type Hex } from './hex'

export const pathExists = z.string().refine(existsSync, (val) => ({
    message: `File [${val}] does not exist`,
}))

export const hex = <S extends boolean>(length?: number, strict?: S) => {
    const validator = strict ? isStrictHexString : isHexString

    return z.string().refine((v): v is (S extends true ? Hex : string) => validator(v, length), (value) => ({
        message: `[${value}] is not a valid hex string`,
    }))
}
