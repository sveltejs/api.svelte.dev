import { uid } from 'uid';

import type { Identifiers } from './database';

export function format<K extends keyof Identifiers>(type: K, uid: Identifiers[K]) {
	return `${type}__${uid}`;
}

export function gen<N extends number>(len: N): Fixed.String<N> {
	return uid(len) as Fixed.String<N>;
}

export async function until<X extends string>(
	toMake: () => X,
	toSearch: (val: X) => Promise<unknown | false>
): Promise<X> {
	let exists, tmp = '' as X;
	while (exists !== false) {
		exists = await toSearch(tmp = toMake());
	}
	return tmp;
}
