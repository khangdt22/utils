import { accessSync, constants, type PathLike } from 'node:fs'

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
