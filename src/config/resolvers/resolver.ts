import type { AnyObject } from '../../object'

export abstract class Resolver {
    public abstract resolve(metadata: AnyObject, resolvedConfig: AnyObject): AnyObject

    public addMetadata(): AnyObject {
        return {}
    }
}
