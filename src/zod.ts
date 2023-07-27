import { existsSync } from 'node:fs'
import { z } from 'zod'
import { isHexString } from './hex'

export const pathExists = z.string().refine(existsSync, (val) => ({
    message: `File [${val}] does not exist`,
}))

export const hex = z.string().refine((value) => isHexString(value), (value) => ({
    message: `[${value}] is not a valid hex string`,
}))

export const hash = z.string().refine((value) => isHexString(value, 64), (value) => ({
    message: `[${value}] is not a valid hash`,
}))
