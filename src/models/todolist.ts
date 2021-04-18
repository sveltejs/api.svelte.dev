import * as database from '../utils/database';
import * as keys from '../utils/keys';

import type { UID } from 'worktop/utils';

export type TodoID = UID<36>;

// to differentiate from UserID, since user's don't log in
// to read and write TODOs; they use an anonymous cookie
export type GuestID = string;

export interface Todo {
	uid: TodoID;
	created_at: TIMESTAMP;
	text: string;
	done: boolean;
}

export type TodoList = Todo[];

const TTL = 60 * 60 * 24 * 30; // 30 days, in seconds
export function sync(userid: GuestID, list: TodoList): Promise<boolean> {
	return database.put('todolist', userid, list, { expirationTtl: TTL });
}

export function lookup(userid: GuestID) {
	return database.get('todolist', userid);
}

export async function insert(userid: GuestID, text: string) {
	try {
		const list = await lookup(userid) || [];

		const todo: Todo = {
			uid: keys.gen(36),
			created_at: Date.now(),
			text,
			done: false
		};

		list.push(todo);
		if (!await sync(userid, list)) return;

		return todo;
	} catch (err) {
		console.error('todolist.insert ::', err.message);
	}
}

export async function update(userid: GuestID, uid: TodoID, patch: { text?: string, done?: boolean }) {
	try {
		const list = await lookup(userid);
		if (!list) return;

		for (const todo of list) {
			if (todo.uid === uid) {
				if ('text' in patch) {
					todo.text = patch.text as string;
				}

				if ('done' in patch) {
					todo.done = patch.done as boolean;
				}

				if (await sync(userid, list)) return true;
			}
		}
	} catch (err) {
		console.error('todolist.update ::', err.message);
	}
}

export async function destroy(userid: GuestID, uid: TodoID) {
	try {
		const list = await lookup(userid);
		if (!list) return;

		let i = list.length;
		while (i--) {
			if (list[i].uid === uid) {
				list.splice(i, 1);

				if (await sync(userid, list)) return true;
			}
		}
	} catch (err) {
		console.error('todolist.destroy ::', err.message);
	}
}
