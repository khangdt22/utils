import { EventEmitter } from 'node:events'
import type { Fn } from './function'

export class TypedEventEmitter<TEvents extends Record<string, Fn>> extends EventEmitter {
    public override addListener<N extends keyof TEvents>(name: Extract<N, string>, listener: TEvents[N]) {
        return super.addListener(name, listener)
    }

    public override on<N extends keyof TEvents>(name: Extract<N, string>, listener: TEvents[N]) {
        return super.on(name, listener)
    }

    public override once<N extends keyof TEvents>(name: Extract<N, string>, listener: TEvents[N]) {
        return super.once(name, listener)
    }

    public override removeListener<N extends keyof TEvents>(name: Extract<N, string>, listener: TEvents[N]) {
        return super.removeListener(name, listener)
    }

    public override off<N extends keyof TEvents>(name: Extract<N, string>, listener: TEvents[N]) {
        return super.off(name, listener)
    }

    public override removeAllListeners<N extends keyof TEvents>(name: Extract<N, string>) {
        return super.removeAllListeners(name)
    }

    public override listeners<N extends keyof TEvents>(name: Extract<N, string>) {
        return super.listeners(name)
    }

    public override rawListeners<N extends keyof TEvents>(name: Extract<N, string>) {
        return super.rawListeners(name)
    }

    public override emit<N extends keyof TEvents>(name: Extract<N, string>, ...args: Parameters<TEvents[N]>) {
        return super.emit(name, ...args)
    }

    public override listenerCount<N extends keyof TEvents>(name: Extract<N, string>, listener?: TEvents[N]) {
        return super.listenerCount(name, listener)
    }

    public override prependListener<N extends keyof TEvents>(name: Extract<N, string>, listener: TEvents[N]) {
        return super.prependListener(name, listener)
    }

    public override prependOnceListener<N extends keyof TEvents>(name: Extract<N, string>, listener: TEvents[N]) {
        return super.prependOnceListener(name, listener)
    }
}
