import { existsSync } from 'node:fs'
import type { ParseReviver } from '../../json'
import { InvalidConfigFileError } from '../errors'
import { isReadable, readJsonFile } from '../../fs'
import type { AnyObject } from '../../object'
import { Resolver } from './resolver'

export interface FileResolverOptions {
    path?: string
    required?: boolean
    argvKey?: string
    envKey?: string
    reviver?: ParseReviver
}

export class FileResolver extends Resolver {
    protected readonly required: boolean
    protected readonly argvKey?: string
    protected readonly envKey?: string
    protected readonly reviver?: ParseReviver

    public constructor(protected readonly options: FileResolverOptions = {}) {
        super()

        const { required = false, argvKey = 'config-path', envKey = 'CONFIG_PATH', reviver } = options

        this.required = required
        this.argvKey = argvKey
        this.envKey = envKey
        this.reviver = reviver
    }

    public resolve(metadata: AnyObject) {
        const configPath = this.getConfigPath(metadata)

        if (this.required && !configPath) {
            throw new InvalidConfigFileError('unknown', 'Config path is required')
        }

        const isExists = configPath && existsSync(configPath) && isReadable(configPath)

        if (!this.required && !isExists) {
            return {}
        }

        if (!configPath?.length) {
            throw new InvalidConfigFileError(configPath ?? '', 'Config path can not be empty')
        }

        if (!isExists) {
            throw new InvalidConfigFileError(configPath, 'Config file is not exists or not readable')
        }

        try {
            return readJsonFile(configPath, this.reviver)
        } catch (error) {
            throw new InvalidConfigFileError(configPath, 'Config file is not a valid JSON/JSON5 file', { cause: error })
        }
    }

    protected getConfigPath(metadata: AnyObject) {
        const argv = this.argvKey ? metadata.argv?.[this.argvKey] : undefined
        const env = this.envKey ? process.env[this.envKey] : undefined

        return argv ?? env ?? this.options.path
    }
}
