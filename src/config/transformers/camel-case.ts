import camelcaseKeys, { type Options } from 'camelcase-keys'
import type { AnyObject } from '../../object'
import type { Transformer } from '../types'

export type { Options as CamelCaseOptions } from 'camelcase-keys'

export const camelCase = (options?: Options): Transformer => (config: AnyObject) => (
    camelcaseKeys(config, { deep: true, exclude: ['_', '--'], ...options })
)
