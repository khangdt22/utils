export type BufferLike = Buffer | ArrayBuffer | Buffer[]

export function bufferToString(data: BufferLike, encoding: BufferEncoding = 'utf8', separator = ''): string {
    if (Array.isArray(data)) {
        return data.map((item) => bufferToString(item)).join(separator)
    }

    if (data instanceof ArrayBuffer) {
        return Buffer.from(data).toString(encoding)
    }

    return data.toString(encoding)
}
