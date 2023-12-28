import { unflatten as transform, type UnflattenOptions } from 'flat'
import type { AnyObject } from '../../object'
import type { Transformer } from '../types'

export type { UnflattenOptions } from 'flat'

export const unflatten = (options?: UnflattenOptions): Transformer => (config: AnyObject) => (
    transform(config, options)
)
