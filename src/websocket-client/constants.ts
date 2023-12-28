export enum WebsocketClientState {
    INITIAL = 'INITIAL',
    CONNECTING = 'CONNECTING',
    RECONNECTING = 'RECONNECTING',
    CONNECTED = 'CONNECTED',
    DISCONNECTING = 'DISCONNECTING',
    DISCONNECTED = 'DISCONNECTED',
}

export enum WebsocketSendType {
    MESSAGE = 'message',
    PING = 'ping',
    PONG = 'pong',
}
