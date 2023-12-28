import { existsSync } from 'node:fs'
import { z, type ZodTypeAny } from 'zod'
import { isHexString, isStrictHexString, type Hex } from './hex'
import { isWritableDirectory } from './fs'
import type { NonEmptyArray } from './array'

export type ZodInferRecord<T extends Record<string, ZodTypeAny>> = {
    [K in keyof T]: T[K] extends ZodTypeAny ? z.infer<T[K]> | undefined : never
}

export function record<T extends Record<string, ZodTypeAny>>(schema: T, nonEmpty = true) {
    const keys = z.enum(Object.keys(schema) as NonEmptyArray<string>)

    const rule = z.record(keys, z.any()).superRefine((val, ctx) => {
        const keyValidated = (nonEmpty ? z.array(keys).nonempty() : z.array(keys)).safeParse(Object.keys(val))

        if (!keyValidated.success) {
            return keyValidated.error.issues.map((issue) => ctx.addIssue(issue))
        }

        for (const [key, value] of Object.entries(val)) {
            const validated = schema[key as keyof T].safeParse(value)

            if (!validated.success) {
                for (const issue of validated.error.issues) {
                    ctx.addIssue({ ...issue, path: [...ctx.path, key, ...issue.path] })
                }
            }
        }

        return void 0
    })

    return rule.transform((val) => val as ZodInferRecord<T>)
}

export const percentage = z.number().min(0).max(100)

export const pathExists = z.string().refine(existsSync, (val) => ({
    message: `File [${val}] does not exist`,
}))

export const writableDirectory = (recursive = true, falseIfNotExists = false) => z.string().refine(
    (val) => isWritableDirectory(val, recursive, falseIfNotExists),
    (val) => ({ message: `Path ${val} is not a valid directory or not writable` })
)

export const hex = <S extends boolean>(length?: number, strict?: S) => {
    const validator = strict ? isStrictHexString : isHexString

    return z.string().refine((v): v is (S extends true ? Hex : string) => validator(v, length), (value) => ({
        message: `[${value}] is not a valid hex string`,
    }))
}
