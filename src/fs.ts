import { accessSync, constants, type PathLike, readFileSync, existsSync } from 'node:fs'
import JSON5 from 'json5'

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

export function readJsonFile(path: PathLike, reviver?: Parameters<typeof JSON5.parse>[1]) {
    if (!existsSync(path)) {
        throw new Error(`File ${path} does not exist`)
    }

    if (!isReadable(path)) {
        throw new Error(`File ${path} is not readable`)
    }

    return JSON5.parse(readFileSync(path, 'utf8'), reviver)
}

export function writeJsonFile(path: PathLike, data: any, options: Parameters<typeof JSON5.stringify>[1] = {}) {
    if (!isWritable(path)) {
        throw new Error(`File ${path} is not writable`)
    }

    return JSON5.stringify(data, options)
}
