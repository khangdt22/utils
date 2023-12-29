import type { ClientOptions } from 'ws'
import type { BufferLike } from '../../buffer'

export interface WebsocketHeartbeatOptions {
    interval?: number
    pongTimeout?: number
}

export interface WebsocketReconnectOptions {
    retries?: number
    delay?: number
}

export type WebsocketAutoPongMessage = BufferLike | string | ((pingData?: Buffer) => BufferLike | string | undefined)

export interface WebsocketClientOptions extends ClientOptions {
    autoConnect?: boolean
    autoReconnect?: boolean
    autoPong?: boolean
    autoPongMessage?: WebsocketAutoPongMessage
    connectTimeout?: number
    requestTimeout?: number
    disconnectTimeout?: number
    reconnect?: WebsocketReconnectOptions
    heartbeat?: boolean | WebsocketHeartbeatOptions
}

export interface WebsocketSendOptions {
    mask?: boolean
    binary?: boolean
    compress?: boolean
    fin?: boolean
}
