import type { PathLike } from 'node:fs'
import { bufferToString } from './buffer'

export function pathToString(path: PathLike) {
    if (Buffer.isBuffer(path)) {
        return bufferToString(path)
    }

    return path.toString()
}
