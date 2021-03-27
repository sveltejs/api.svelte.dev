import { uid as toUID } from 'worktop/utils';
import type { Identifiers } from './database';

export { until } from 'worktop/kv';

export function format<K extends keyof Identifiers>(type: K, uid: Identifiers[K]) {
	return `${type}__${uid}`;
}

export function gen<N extends number>(len: N): Fixed.String<N> {
	return toUID(len) as Fixed.String<N>;
}
