import { until } from 'worktop/kv';
import { uid } from 'worktop/utils';
import type { Identifiers } from './database';

export function format<K extends keyof Identifiers>(type: K, uid: Identifiers[K]) {
	return `${type}__${uid}`;
}

const get_uid = () => uid(36);

export function unique_uid(fn: (id: string) => Promise<boolean>) {
	return until(get_uid, fn);
}

export { uid };