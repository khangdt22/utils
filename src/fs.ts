import { accessSync, constants, type PathLike, readFileSync, writeFileSync, createReadStream } from 'node:fs'
import { createHash, type HashOptions } from 'node:crypto'
import type { StringifyOptions, ParseReviver } from './json'
import { stringify, parse } from './json'
import { createDeferred } from './promise'

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

export interface GetFileHashOptions {
    hash?: HashOptions
    stream?: Parameters<typeof createReadStream>[1]
}

export async function verifyFileHash(path: PathLike, hash: string, algorithm: string, options?: GetFileHashOptions) {
    return getFileHash(path, algorithm, options).then((checksum) => checksum === hash)
}

export async function getFileHash(path: PathLike, algorithm: string, options: GetFileHashOptions = {}) {
    const hash = createHash(algorithm, options.hash).setEncoding('hex')
    const stream = createReadStream(path, options.stream)
    const checksum = createDeferred<string>()

    stream.on('error', (error) => checksum.reject(error))
    stream.on('data', (data) => hash.update(data))
    stream.on('end', () => checksum.resolve(hash.digest('hex')))

    return checksum
}
