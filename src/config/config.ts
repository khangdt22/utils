import { type AnyZodObject, type TypeOf, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import type { AnyObject } from '../object'
import type { ConfigOptions } from './types'
import { InvalidConfigError } from './errors'
import type { Resolver } from './resolvers'

export class Config<S extends AnyZodObject = AnyZodObject> {
    protected readonly resolvers: Set<Resolver>
    protected readonly errorFormatter: (error: Error) => Error

    public constructor(public readonly schema: S, protected readonly options: ConfigOptions = {}) {
        this.resolvers = new Set(options.resolvers)
        this.errorFormatter = this.getErrorFormatter()
    }

    public addResolver(resolver: Resolver) {
        this.resolvers.add(resolver)
    }

    public resolve() {
        const config: AnyObject = {}
        const metadata: AnyObject = {}

        for (const resolver of this.resolvers) {
            Object.assign(metadata, resolver.addMetadata())
        }

        for (const resolver of this.resolvers) {
            try {
                Object.assign(config, resolver.resolve(metadata, config))
            } catch (error) {
                throw Object.assign(new InvalidConfigError(config, `Failed to resolve config`, { cause: error }), { resolver })
            }
        }

        return config
    }

    public parse(): TypeOf<S> {
        const config = this.resolve()
        const result = this.schema.safeParse(config)

        if (!result.success) {
            throw new InvalidConfigError(config, 'Failed to parse config', { cause: this.errorFormatter(result.error) })
        }

        return result.data
    }

    protected getErrorFormatter() {
        const { formatError = true, formatErrorOptions = {} } = this.options

        if (!formatError) {
            return (error: Error) => error
        }

        return (error: Error) => (this.isZodError(error) ? fromZodError(error, formatErrorOptions) : error)
    }

    protected isZodError(error: unknown): error is ZodError {
        return error instanceof ZodError || (error instanceof Error && error.name === 'ZodError')
    }
}
