import type { AnyObject } from '../../object'

export class InvalidConfigError extends Error {
    public constructor(public readonly config: AnyObject, message?: string, options?: ErrorOptions) {
        super(message ?? 'An error occurred', options)
    }
}
