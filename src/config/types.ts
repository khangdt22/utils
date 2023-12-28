import type { FromZodErrorOptions } from 'zod-validation-error'
import type { AnyObject } from '../object'
import type { Resolver } from './resolvers'

export interface ConfigOptions {
    resolvers?: Resolver[]
    formatError?: boolean
    formatErrorOptions?: FromZodErrorOptions
}

export type Transformer = (config: AnyObject) => AnyObject
