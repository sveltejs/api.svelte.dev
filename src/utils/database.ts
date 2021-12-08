import * as keys from './keys';

import type { KV } from 'worktop/kv';
import type { Gist, GistID } from '../models/gist';
import type { Session, SessionID } from '../models/session';
import type { TodoList, GuestID } from '../models/todolist';
import type { User, UserGist, UserID } from '../models/user';
import { HttpError } from './index';

declare const DATAB: KV.Namespace;

export interface Identifiers {
	gist: GistID;
	owner: UserID;
	session: SessionID;
	todolist: GuestID;
	user: UserID;
}

export interface Models {
	gist: Gist;
	owner: UserGist[];
	session: Session;
	todolist: TodoList;
	user: User;
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
