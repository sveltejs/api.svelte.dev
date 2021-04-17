import type { Identifiers } from './database';

export function format<K extends keyof Identifiers>(type: K, uid: Identifiers[K]) {
	return `${type}__${uid}`;
}

export { until } from 'worktop/kv';
export { uid as gen } from 'worktop/utils';
