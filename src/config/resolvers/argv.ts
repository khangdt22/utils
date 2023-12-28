import parseArgs from 'minimist'
import type { Transformer } from '../types'
import { camelCase } from '../transformers'
import { Resolver } from './resolver'

export interface ArgvResolverOptions extends parseArgs.Opts {
    argv?: string[]
    transformers?: Transformer[]
}

export class ArgvResolver extends Resolver {
    protected readonly argv: string[]
    protected readonly args: Record<string, string | boolean | number>
    protected readonly transformers: Transformer[]

    public constructor(options: ArgvResolverOptions = {}) {
        super()

        this.argv = options.argv ?? process.argv.slice(2)
        this.args = parseArgs(this.argv, options)
        this.transformers = options.transformers ?? [camelCase()]
    }

    public resolve() {
        return this.transformers.reduce((config, transformer) => transformer(config), this.args)
    }

    public override addMetadata() {
        return { argv: this.args }
    }
}
