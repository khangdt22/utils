export class WebsocketError extends Error {
    public constructor(public readonly address: string, message?: string, options?: ErrorOptions) {
        super(message, options)
    }
}
