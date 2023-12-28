import type { WebsocketSendType } from '../constants'
import type { WebsocketSendOptions } from '../types'
import { WebsocketError } from './websocket-error'

export class WebsocketRequestError extends WebsocketError {
    public declare readonly type: WebsocketSendType
    public declare readonly data: any
    public declare readonly options: WebsocketSendOptions

    public setRequestData(type: WebsocketSendType, data: any, options?: WebsocketSendOptions) {
        Object.defineProperty(this, 'type', { value: type })
        Object.defineProperty(this, 'data', { value: data })
        Object.defineProperty(this, 'options', { value: options })

        return this
    }
}
