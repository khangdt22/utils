export class InvalidConfigFileError extends Error {
    public constructor(public readonly path: string, message?: string, options?: ErrorOptions) {
        super(message, options)
    }
}
