import { isString } from './string'

export type BufferLike = Buffer | ArrayBuffer | Buffer[]

export function bufferToString(data: BufferLike | string, encoding: BufferEncoding = 'utf8', separator = ''): string {
    if (isString(data)) {
        return data
    }

    if (Array.isArray(data)) {
        return data.map((item) => bufferToString(item)).join(separator)
    }

    if (data instanceof ArrayBuffer) {
        return Buffer.from(data).toString(encoding)
    }

    return data.toString(encoding)
}
