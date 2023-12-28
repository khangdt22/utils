import type { AnyZodObject } from 'zod'
import { resolveNestedOptions } from '../options'
import { Config } from './config'
import { type FileResolverOptions, FileResolver, type ArgvResolverOptions, ArgvResolver, type EnvResolverOptions, EnvResolver } from './resolvers'
import type { ConfigOptions } from './types'

export * from './config'
export * from './errors'
export * from './resolvers'
export * from './transformers'
export * from './types'

export interface DefineConfigOptions extends Omit<ConfigOptions, 'resolvers'> {
    file?: boolean | FileResolverOptions
    argv?: boolean | ArgvResolverOptions
    env?: boolean | EnvResolverOptions
}

export function defineConfig<T extends AnyZodObject>(schema: T, options: DefineConfigOptions = {}) {
    const { file, ...configOptions } = options
    const fileOptions = resolveNestedOptions(file)
    const argvOptions = resolveNestedOptions(options.argv)
    const envOptions = resolveNestedOptions(options.env)

    const config = new Config(schema, configOptions)

    if (fileOptions !== false) {
        config.addResolver(new FileResolver({ path: 'config.json5', ...fileOptions }))
    }

    if (argvOptions !== false) {
        config.addResolver(new ArgvResolver(argvOptions))
    }

    if (envOptions !== false) {
        config.addResolver(new EnvResolver(envOptions))
    }

    return config.parse()
}
