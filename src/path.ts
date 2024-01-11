import type { PathLike } from 'node:fs'
import { join, resolve, dirname as _dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { bufferToString } from './buffer'

export function pathToString(path: PathLike) {
    if (Buffer.isBuffer(path)) {
        return bufferToString(path)
    }

    return path.toString()
}

export function dirname(importMeta: ImportMeta, ...path: PathLike[]) {
    return join(resolve(_dirname(fileURLToPath(importMeta.url))), ...path.map(pathToString))
}
