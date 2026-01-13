import { Runtimes } from '../../types';
export const RUNTIME: Runtimes[] = ['node', 'web'] as const

export const WEB_RUNTIME: 'web'[] = ['web']
export const NODE_RUNTIME: ('web' | 'node')[] = ['web', 'node']

