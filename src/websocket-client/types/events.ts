import type { ClientRequest, IncomingMessage } from 'node:http'
import type { BufferLike } from '../../buffer'

export type WebsocketClientEvents = {
    'connect': () => void
    'connected': () => void
    'reconnect': () => void
    'reconnected': () => void
    'disconnect': () => void
    'disconnected': () => void
    'close': (code?: number, reason?: string) => void
    'error': (error: Error) => void
    'ping': (data?: string) => void
    'pong': (data?: string) => void
    'message': (data: string) => void
    'binary-message': (data: BufferLike) => void
    'redirect': (url: string, request: ClientRequest) => void
    'unexpected-response': (request: ClientRequest, response: IncomingMessage) => void
    'upgrade': (response: IncomingMessage) => void
}
