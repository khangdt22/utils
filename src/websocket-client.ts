import type { ClientRequest, IncomingMessage } from 'node:http'
import type { ClientOptions } from 'ws'
import { WebSocket } from 'ws'
import { TypedEventEmitter } from './event'
import { createDeferred, withTimeout, withRetry } from './promise'
import { resolveNestedOptions } from './options'

export interface HeartbeatOptions {
    interval?: number
    pongTimeout?: number
}

export interface ReconnectOptions {
    retries?: number
    delay?: number
}

export interface WebsocketClientOptions extends ClientOptions {
    autoConnect?: boolean
    autoReconnect?: boolean
    autoPong?: boolean
    connectTimeout?: number
    requestTimeout?: number
    disconnectTimeout?: number
    reconnect?: ReconnectOptions
    heartbeat?: boolean | HeartbeatOptions
}

export type WebsocketClientEvents = {
    'connect': () => void
    'connected': () => void
    'reconnect': () => void
    'reconnected': () => void
    'disconnect': () => void
    'disconnected': () => void
    'close': (code?: number, reason?: Buffer) => void
    'error': (error: Error) => void
    'ping': (data: Buffer) => void
    'pong': (data: Buffer) => void
    'message': (data: string) => void
    'binary-message': (data: Buffer | ArrayBuffer | Buffer[]) => void
    'redirect': (url: string, request: ClientRequest) => void
    'unexpected-response': (request: ClientRequest, response: IncomingMessage) => void
    'upgrade': (response: IncomingMessage) => void
}

export enum WebsocketClientState {
    INITIAL = 'INITIAL',
    CONNECTING = 'CONNECTING',
    RECONNECTING = 'RECONNECTING',
    CONNECTED = 'CONNECTED',
    DISCONNECTING = 'DISCONNECTING',
    DISCONNECTED = 'DISCONNECTED',
}

export class WebsocketError extends Error {
    public constructor(public readonly address: string, message?: string, options?: ErrorOptions) {
        super(message, options)
    }
}

export class WebsocketRequestError extends WebsocketError {
    public setRequestData(data: any) {
        Object.defineProperty(this, 'data', { value: data })

        return this
    }
}

export class WebsocketClient extends TypedEventEmitter<WebsocketClientEvents> {
    public state: WebsocketClientState = WebsocketClientState.INITIAL

    protected readonly autoPong: boolean
    protected readonly autoReconnect: boolean
    protected readonly connectTimeout: number
    protected readonly requestTimeout: number
    protected readonly disconnectTimeout: number
    protected readonly heartbeat: boolean | HeartbeatOptions

    protected client?: WebSocket
    protected pingTimer?: NodeJS.Timeout
    protected pongTimer?: NodeJS.Timeout
    protected disconnectRequest?: ReturnType<typeof createDeferred<void>>

    public constructor(public readonly address: string, protected readonly options: WebsocketClientOptions = {}) {
        super()

        this.autoPong = options.autoPong ?? true
        this.autoReconnect = options.autoReconnect ?? true
        this.connectTimeout = options.connectTimeout ?? 10_000
        this.requestTimeout = options.requestTimeout ?? 10_000
        this.disconnectTimeout = options.disconnectTimeout ?? 10_000
        this.heartbeat = options.heartbeat ?? true

        if (options.autoConnect) {
            this.connect().catch((error) => this.onError(error))
        }
    }

    public get ready() {
        return this.client && this.client.readyState === WebSocket.OPEN
    }

    public async connect() {
        if (this.state !== WebsocketClientState.INITIAL && this.state !== WebsocketClientState.DISCONNECTED) {
            return
        }

        this.state = WebsocketClientState.CONNECTING
        this.emit('connect')

        return this.init().then(() => this.emit('connected'))
    }

    public async reconnect() {
        const { retries = 3, delay = 0 } = this.options.reconnect ?? {}

        this.state = WebsocketClientState.RECONNECTING
        this.emit('reconnect')
        this.client?.terminate()

        await withRetry(() => this.init(), retries, delay).then(() => this.emit('reconnected')).catch((error) => {
            throw new WebsocketError(this.address, 'Reconnect failed', { cause: error })
        })
    }

    public async disconnect(code?: number, reason?: Buffer | string) {
        if (!this.ready) {
            return
        }

        this.state = WebsocketClientState.DISCONNECTING
        this.disconnectRequest = createDeferred<void>()

        this.emit('disconnect')
        this.client!.close(code, reason)

        await withTimeout(this.disconnectRequest, this.disconnectTimeout).catch(() => {
            this.client!.terminate()
        })

        this.disconnected()
    }

    public async send(data: any, type: 'ping' | 'pong' | 'message' = 'message') {
        if (!this.ready) {
            throw new WebsocketError(this.address, 'Not connected')
        }

        const isSent = createDeferred<void>()
        const cb = (error: any) => (error ? isSent.reject(error) : isSent.resolve())

        if (type === 'ping') {
            this.client!.ping(data, undefined, cb)
        } else if (type === 'pong') {
            this.client!.pong(data, undefined, cb)
        } else {
            this.client!.send(data, cb)
        }

        return withTimeout(isSent, this.requestTimeout, 'Request timeout').catch((error) => {
            throw new WebsocketRequestError(this.address, 'Request error', { cause: error }).setRequestData(data)
        })
    }

    public async ping(data: any) {
        return this.send(data, 'ping')
    }

    public async pong(data: any) {
        return this.send(data, 'pong')
    }

    protected async init() {
        this.clearTimers()

        const isConnected = createDeferred<void>()
        const client = this.client = new WebSocket(this.address, this.options)

        client.on('close', (code, reason) => (isConnected.isSettled ? this.onClose(code, reason) : isConnected.reject(new WebsocketError(this.address, 'Unexpected close'))))
        client.on('error', (error) => (isConnected.isSettled ? this.onError(error) : isConnected.reject(error)))
        client.on('message', this.onMessage.bind(this))
        client.on('open', () => Promise.resolve(this.onOpen()).then(() => isConnected.resolve()))
        client.on('ping', this.onPing.bind(this))
        client.on('pong', this.onPong.bind(this))
        client.on('redirect', (url, request) => this.emit('redirect', url, request))
        client.on('unexpected-response', (request, response) => this.emit('unexpected-response', request, response))
        client.on('upgrade', (response) => this.emit('upgrade', response))

        return withTimeout(isConnected, this.connectTimeout, 'Connect timeout').catch((error) => {
            throw new WebsocketError(this.address, 'Connect failed', { cause: error })
        })
    }

    protected onOpen() {
        if (this.heartbeat) {
            const { interval = 30_000, pongTimeout = 10_000 } = resolveNestedOptions(this.heartbeat)

            this.pingTimer = setInterval(
                () => {
                    this.pongTimer = setTimeout(() => this.client!.terminate(), pongTimeout)
                    this.client!.ping()
                },
                interval
            )
        }

        this.state = WebsocketClientState.CONNECTED
    }

    protected onClose(code?: number, reason?: Buffer) {
        this.clearTimers()

        if (this.state === WebsocketClientState.RECONNECTING) {
            return
        }

        this.emit('close', code, reason)
        this.disconnectRequest?.resolve()

        if (this.state === WebsocketClientState.DISCONNECTING) {
            return
        }

        if (this.autoReconnect) {
            this.reconnect().catch((error) => {
                this.disconnected()
                this.onError(error)
            })
        } else {
            this.disconnected()
        }
    }

    protected onError(error: Error) {
        if (!this.ready) {
            this.state = WebsocketClientState.DISCONNECTED
        }

        if (this.listenerCount('error') === 0) {
            throw new WebsocketError(this.address, 'An error occurred', { cause: error })
        } else {
            this.emit('error', error)
        }
    }

    protected onMessage(data: Buffer | ArrayBuffer | Buffer[], isBinary: boolean) {
        this.clearPongTimer()

        if (isBinary) {
            this.emit('binary-message', data)
        } else {
            this.emit('message', this.parseMessage(data))
        }
    }

    protected onPing(data: Buffer) {
        if (this.autoPong) {
            this.client?.pong()
        }

        this.emit('ping', data)
    }

    protected onPong(data: Buffer) {
        this.clearPongTimer()
        this.emit('pong', data)
    }

    protected disconnected() {
        this.state = WebsocketClientState.DISCONNECTED
        this.emit('disconnected')
    }

    protected clearTimers() {
        this.clearPingTimer()
        this.clearPongTimer()
    }

    protected clearPingTimer() {
        clearInterval(this.pingTimer)
    }

    protected clearPongTimer() {
        clearTimeout(this.pongTimer)
    }

    protected parseMessage(data: Buffer | ArrayBuffer | Buffer[]): string {
        if (Array.isArray(data)) {
            return data.map((item) => this.parseMessage(item)).join('')
        }

        if (data instanceof ArrayBuffer) {
            data = Buffer.from(data)
        }

        return data.toString('utf8')
    }
}
