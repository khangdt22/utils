import { accessSync, constants, type PathLike, readFileSync, writeFileSync } from 'node:fs'
import type { StringifyOptions, ParseReviver } from './json'
import { stringify, parse } from './json'

export function hasAccess(path: PathLike, mode?: number) {
    try {
        accessSync(path, mode)

        return true
    } catch {
        return false
    }
}

export function isReadable(path: PathLike) {
    return hasAccess(path, constants.R_OK)
}

export function isWritable(path: PathLike) {
    return hasAccess(path, constants.W_OK)
}

export function isReadableAndWritable(path: PathLike) {
    return hasAccess(path, constants.R_OK | constants.W_OK)
}

export function readJsonFile(path: PathLike, reviver?: ParseReviver) {
    return parse(readFileSync(path, 'utf8'), reviver)
}

export function writeJsonFile(path: PathLike, data: any, options?: StringifyOptions) {
    writeFileSync(path, stringify(data, options), { encoding: 'utf8' })
}
