import * as database from '../utils/database';
import * as keys from '../utils/keys';

import type { UID } from 'worktop/utils';

export type TodoID = UID<36>;

// to differentiate from UserID, since user's don't log in
// to read and write TODOs; they use an anonymous cookie
export type GuestID = string;

export interface Todo {
	todoid: TodoID;
	created_at: TIMESTAMP;
	text: string;
	done: boolean;
}

export type TodoList = Todo[];

const TTL = 60 * 60 * 24 * 30; // 30 days, in seconds
export function sync(guestid: GuestID, list: TodoList): Promise<void> {
	return database.put('todolist', guestid, list, { expirationTtl: TTL });
}

export function lookup(guestid: GuestID) {
	return database.get('todolist', guestid);
}

export async function insert(guestid: GuestID, text: string) {
	const list = await lookup(guestid) || [];

	const todo: Todo = {
		todoid: keys.gen(36),
		created_at: Date.now(),
		text,
		done: false
	};

	list.push(todo);

	await sync(guestid, list);

	return todo;
}

export async function update(guestid: GuestID, todoid: TodoID, patch: { text?: string, done?: boolean }) {
	const list = await lookup(guestid);
	if (!list) return;

	for (const todo of list) {
		if (todo.todoid === todoid) {
			if ('text' in patch) {
				todo.text = patch.text as string;
			}

			if ('done' in patch) {
				todo.done = patch.done as boolean;
			}

			await sync(guestid, list);

			return todo;
		}
	}
}

export async function destroy(guestid: GuestID, todoid: TodoID) {
	const list = await lookup(guestid);

	let i = list.length;
	while (i--) {
		if (list[i].todoid === todoid) {
			list.splice(i, 1);

			await sync(guestid, list);
			return;
		}
	}
}
