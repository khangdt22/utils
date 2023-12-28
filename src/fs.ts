import { accessSync, constants, type PathLike, readFileSync, writeFileSync, createReadStream, existsSync, createWriteStream, lstatSync, mkdirSync, type MakeDirectoryOptions } from 'node:fs'
import { dirname, join, parse as parsePath } from 'node:path'
import { createHash, type HashOptions } from 'node:crypto'
import { mkdir, rm, unlink, writeFile } from 'node:fs/promises'
import { get } from 'node:https'
import { Buffer } from 'node:buffer'
import type { StringifyOptions, ParseReviver } from './json'
import { stringify, parse } from './json'
import { createDeferred } from './promise'
import { bufferToString } from './buffer'

export function pathToString(path: PathLike) {
    if (Buffer.isBuffer(path)) {
        return bufferToString(path)
    }

    return path.toString()
}

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

export function isWritableDirectory(path: PathLike, recursive = true, falseIfNotExists = false) {
    const exists = existsSync(path)

    if ((!exists && falseIfNotExists) || (exists && isFile(path))) {
        return false
    }

    if (recursive && !exists) {
        return isWritableDirectory(dirname(pathToString(path)))
    }

    return isWritable(path)
}

export function isReadableAndWritable(path: PathLike) {
    return hasAccess(path, constants.R_OK | constants.W_OK)
}

export function isFile(path: PathLike) {
    return lstatSync(path).isFile()
}

export function isDirectory(path: PathLike) {
    return lstatSync(path).isDirectory()
}

export function ensureDirectory(path: PathLike, options: MakeDirectoryOptions = {}) {
    if (!existsSync(path)) {
        mkdirSync(path, { recursive: true, ...options })
    }
}

export function readJsonFile(path: PathLike, reviver?: ParseReviver) {
    return parse(readFileSync(path, 'utf8'), reviver)
}

export interface WriteJsonFileOptions {
    replacer?: Parameters<typeof JSON.stringify>[1]
    space?: Parameters<typeof JSON.stringify>[2]
}

export function writeJsonFile(path: PathLike, data: any, options: WriteJsonFileOptions = {}) {
    writeFileSync(path, JSON.stringify(data, options.replacer, options.space), { encoding: 'utf8' })
}

export async function writeJsonFileAsync(path: PathLike, data: any, options: WriteJsonFileOptions = {}) {
    return writeFile(path, JSON.stringify(data, options.replacer, options.space), { encoding: 'utf8' })
}

export function writeJson5File(path: PathLike, data: any, options?: StringifyOptions) {
    writeFileSync(path, stringify(data, options), { encoding: 'utf8' })
}

export function writeJson5FileAsync(path: PathLike, data: any, options?: StringifyOptions) {
    return writeFileSync(path, stringify(data, options), { encoding: 'utf8' })
}

export interface GetFileHashOptions {
    hash?: HashOptions
    stream?: Parameters<typeof createReadStream>[1]
}

export interface VerifyFileHashOptions extends GetFileHashOptions {
    throwOnInvalid?: boolean
}

export async function verifyFileHash(path: PathLike, hash: string, algorithm: string, options?: VerifyFileHashOptions) {
    const fileHash = await getFileHash(path, algorithm, options)
    const isValid = fileHash === hash
    const { throwOnInvalid = true } = options ?? {}

    if (!isValid && throwOnInvalid) {
        throw new Error(`File ${path} is corrupted, hash: ${fileHash}, expected: ${hash}`)
    }

    return isValid
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

export interface DownloadFileOptions {
    filename?: string
    stream?: Parameters<typeof createWriteStream>[1]
}

export async function downloadFile(url: string, outDir: string, options: DownloadFileOptions = {}) {
    const filename = options.filename ?? parsePath(new URL(url).pathname).base
    const output = join(outDir, filename)

    let createDir = false

    if (!existsSync(outDir)) {
        await mkdir(outDir, { recursive: true }).then(() => createDir = true)
    }

    const file = createWriteStream(output, options.stream)
    const isDownloaded = createDeferred<string>()

    get(url, (response) => {
        response.pipe(file)

        file.on('error', async (error) => {
            await unlink(output)

            if (createDir) {
                await rm(outDir, { recursive: true, force: true })
            }

            isDownloaded.reject(error)
        })

        file.on('finish', () => {
            file.close()
            isDownloaded.resolve(output)
        })
    })

    return isDownloaded
}
