import * as keys from './keys';
import { HttpError } from './error';

import type { KV } from 'worktop/kv';
import type { TodoList, GuestID } from '../models/todolist';

declare const DATAB: KV.Namespace;

export interface Identifiers {
	todolist: GuestID;
}

export interface Models {
	todolist: TodoList;
}

export function has<K extends keyof Identifiers>(type: K, uid: Identifiers[K]): Promise<boolean> {
	const keyname = keys.format<K>(type, uid);
	return DATAB.get<Models[K]>(keyname).then(() => true, () => false);
}

export function get<K extends keyof Identifiers>(type: K, uid: Identifiers[K]): Promise<Models[K]> {
	const keyname = keys.format<K>(type, uid);

	try {
		return DATAB.get<Models[K]>(keyname, 'json');
	} catch {
		throw new HttpError('Not found', 404);
	}
}

export function put<K extends keyof Identifiers>(type: K, uid: Identifiers[K], value: Models[K], options?: KV.WriteOptions): Promise<void> {
	const keyname = keys.format<K>(type, uid);
	return DATAB.put(keyname, JSON.stringify(value), options);
}

export async function remove<K extends keyof Identifiers>(type: K, uid: Identifiers[K]): Promise<void> {
	const keyname = keys.format<K>(type, uid);
	return DATAB.delete(keyname);
}
