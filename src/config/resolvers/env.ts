import { type DotenvConfigOptions, config as loadEnvFile } from 'dotenv'
import type { Transformer } from '../types'
import { camelCase, unflatten } from '../transformers'
import { Resolver } from './resolver'

export interface EnvResolverOptions extends DotenvConfigOptions {
    transformers?: Transformer[]
}

export class EnvResolver extends Resolver {
    protected readonly transformers: Transformer[]
    protected readonly loadResult: ReturnType<typeof loadEnvFile>

    public constructor(options: EnvResolverOptions = {}) {
        super()

        this.loadResult = loadEnvFile(options)
        this.transformers = options.transformers ?? [unflatten(), camelCase()]
    }

    public resolve() {
        return this.transformers.reduce((config, transformer) => transformer(config), { ...process.env })
    }
}
