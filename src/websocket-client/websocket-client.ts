import { WebSocket } from 'ws'
import { TypedEventEmitter } from '../event'
import { createDeferred, withTimeout, withRetry } from '../promise'
import { resolveNestedOptions } from '../options'
import { type BufferLike, bufferToString } from '../buffer'
import { notNullish } from '../condition'
import type { WebsocketClientEvents, WebsocketHeartbeatOptions as HeartbeatOptions, WebsocketClientOptions, WebsocketReconnectOptions as ReconnectOptions, WebsocketSendOptions as SendOptions } from './types'
import { WebsocketClientState, WebsocketSendType as SendType } from './constants'
import { WebsocketError, WebsocketRequestError } from './errors'

export class WebsocketClient extends TypedEventEmitter<WebsocketClientEvents> {
    public state: WebsocketClientState = WebsocketClientState.INITIAL

    protected readonly autoPong: boolean
    protected readonly autoReconnect: boolean
    protected readonly connectTimeout: number
    protected readonly requestTimeout: number
    protected readonly disconnectTimeout: number
    protected readonly isHeartbeatEnabled: boolean
    protected readonly heartbeat: Required<HeartbeatOptions>
    protected readonly reconnectOptions: Required<ReconnectOptions>

    protected client?: WebSocket
    protected pingTimer?: NodeJS.Timeout
    protected pongTimer?: NodeJS.Timeout
    protected disconnectRequest?: ReturnType<typeof createDeferred<void>>

    public constructor(public readonly address: string, protected readonly options: WebsocketClientOptions = {}) {
        super()

        const { autoPong = true, autoReconnect = true } = options
        const { connectTimeout = 10_000, requestTimeout = 10_000, disconnectTimeout = 10_000 } = options
        const { isEnabled: isHeartbeatEnabled, options: heartbeatOptions } = this.getHeartbeatOptions(options)
        const { interval: heartbeatInterval = 30_000, pongTimeout: heartbeatPongTimeout = 10_000 } = heartbeatOptions
        const { retries = 3, delay = 1000 } = options.reconnect ?? {}

        this.autoPong = autoPong
        this.autoReconnect = autoReconnect
        this.connectTimeout = connectTimeout
        this.requestTimeout = requestTimeout
        this.disconnectTimeout = disconnectTimeout
        this.isHeartbeatEnabled = isHeartbeatEnabled
        this.heartbeat = { interval: heartbeatInterval, pongTimeout: heartbeatPongTimeout }
        this.reconnectOptions = { retries, delay }

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
        const { retries, delay } = this.reconnectOptions

        this.state = WebsocketClientState.RECONNECTING
        this.emit('reconnect')
        this.client?.terminate()

        await withRetry(this.init.bind(this), retries, delay).then(() => this.emit('reconnected')).catch((error) => {
            throw new WebsocketError(this.address, 'Reconnect failed', { cause: error })
        })
    }

    public async disconnect(code?: number, reason?: string) {
        if (!this.ready) {
            return
        }

        this.state = WebsocketClientState.DISCONNECTING
        this.disconnectRequest = createDeferred<void>()

        this.emit('disconnect')
        this.client?.close(code, reason)

        await withTimeout(this.disconnectRequest, this.disconnectTimeout).catch(() => {
            this.client?.terminate()
        })

        this.disconnected()
    }

    public async send(data: BufferLike | string, type: SendType = SendType.MESSAGE, options: SendOptions = {}) {
        if (!this.ready || !this.client) {
            throw new WebsocketError(this.address, 'Not connected')
        }

        const isSent = createDeferred<void>()
        const cb = (error: any) => (error ? isSent.reject(error) : isSent.resolve())

        const send = {
            [SendType.PING]: () => this.client!.ping(data, options.mask, cb),
            [SendType.PONG]: () => this.client!.pong(data, options.mask, cb),
            [SendType.MESSAGE]: () => this.client!.send(data, options, cb),
        }

        send[type]()

        return withTimeout(isSent, this.requestTimeout, 'Request timeout').catch((error) => {
            throw new WebsocketRequestError(this.address, 'Request error', { cause: error }).setRequestData(type, data, options)
        })
    }

    public async ping(data: BufferLike | string) {
        return this.send(data, SendType.PING)
    }

    public async pong(data: BufferLike | string) {
        return this.send(data, SendType.PONG)
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
        if (this.isHeartbeatEnabled) {
            this.startHeartbeat()
        }

        this.state = WebsocketClientState.CONNECTED
    }

    protected startHeartbeat() {
        this.pingTimer = setInterval(() => this.runHeartbeat(), this.heartbeat.interval)
    }

    protected runHeartbeat() {
        if (this.client) {
            this.pongTimer = setTimeout(() => this.client?.terminate(), this.heartbeat.pongTimeout)
            this.client.ping()
        }
    }

    protected onClose(code?: number, reason?: Buffer) {
        this.clearTimers()

        if (this.state === WebsocketClientState.RECONNECTING) {
            return
        }

        this.emit('close', code, notNullish(reason) ? bufferToString(reason) : undefined)
        this.disconnectRequest?.resolve()

        if (this.state === WebsocketClientState.DISCONNECTING) {
            return
        }

        if (this.autoReconnect) {
            this.reconnect().catch((error) => Promise.resolve(this.disconnected()).then(() => this.onError(error)))
        } else {
            this.disconnected()
        }
    }

    protected onError(error: Error) {
        if (this.listenerCount('error') === 0) {
            throw new WebsocketError(this.address, 'An error occurred', { cause: error })
        } else {
            this.emit('error', error)
        }
    }

    protected onMessage(data: BufferLike, isBinary: boolean) {
        this.clearPongTimer()

        if (isBinary) {
            this.emit('binary-message', data)
        } else {
            this.emit('message', bufferToString(data))
        }
    }

    protected onPing(data?: Buffer) {
        if (this.autoPong) {
            this.client?.pong()
        }

        this.emit('ping', notNullish(data) ? bufferToString(data) : undefined)
    }

    protected onPong(data: Buffer) {
        this.clearPongTimer()
        this.emit('pong', notNullish(data) ? bufferToString(data) : undefined)
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

    protected getHeartbeatOptions(options?: WebsocketClientOptions) {
        const resolved = resolveNestedOptions(options?.heartbeat) ?? {}

        if (resolved === false) {
            return { isEnabled: false, options: {} }
        }

        return { isEnabled: true, options: resolved }
    }
}
