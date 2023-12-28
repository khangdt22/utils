import type { ClientOptions } from 'ws'

export interface WebsocketHeartbeatOptions {
    interval?: number
    pongTimeout?: number
}

export interface WebsocketReconnectOptions {
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
    reconnect?: WebsocketReconnectOptions
    heartbeat?: boolean | WebsocketHeartbeatOptions
}

export interface WebsocketSendOptions {
    mask?: boolean
    binary?: boolean
    compress?: boolean
    fin?: boolean
}
