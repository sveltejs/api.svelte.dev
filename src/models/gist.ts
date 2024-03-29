import * as User from './user';
import * as database from '../utils/database';
import * as keys from '../utils/keys';

import type { UserID } from './user';
import type { UID } from 'worktop/utils';

export interface File {
	name: string;
	source: string;
}

export type GistID = UID<36>;

export interface Gist {
	uid: GistID;
	userid: UserID;
	name: string;
	files: File[];
	created_at: TIMESTAMP;
	updated_at?: TIMESTAMP;
}

/** Create new `GistID` value */
export const toUID = () => keys.gen(36);

/** Find a Gist by its public ID value */
export async function lookup(uid: GistID) {
	return database.get('gist', uid);
}

/** Create a new Gist for the User */
export async function insert(input: Partial<Gist>, user: User.User): Promise<Gist | void> {
	try {
		const values: Gist = {
			// wait until have unique GistID
			uid: await keys.until(toUID, lookup),
			name: input.name || '',
			files: input.files || [],
			userid: user.uid,
			created_at: Date.now()
		};

		// exit early if could not save new gist record
		if (!await database.put('gist', values.uid, values)) return;

		// synchronize the owner's list of gists
		if (!await sync(values.userid, values)) return;

		// return the new item
		return values;
	} catch (err) {
		console.error('gist.insert ::', err);
	}
}

/** Update the name and/or files for an existing Gist */
export async function update(values: Gist, changes: Gist): Promise<Gist | void> {
	try {
		// carefully choose updated keys
		values.name = changes.name || values.name;
		values.files = changes.files || values.files;
		values.updated_at = Date.now();

		// update the gist with its new values
		if (!await database.put('gist', values.uid, values)) return;

		// synchronize the owner's list of gists
		if (!await sync(values.userid, values)) return;

		// return the updated item
		return values;
	} catch (err) {
		console.error('gist.update ::', err);
	}
}

/** Destroy an existing Gist record */
export async function destroy(item: Gist): Promise<Gist | void> {
	try {
		// remove the gist record itself
		if (!await database.remove('gist', item.uid)) return;

		// synchronize the owner's list of gists
		if (!await sync(item.userid, item, true)) return;

		// return the deleted item
		return item;
	} catch (err) {
		console.error('gist.destroy ::', err);
	}
}

/** Synchronize UserGists list for User/Owner */
export async function sync(userid: UserID, target: Gist | User.UserGist, isRemove = false) {
	const list = await User.gists(userid);

	if (target && target.uid) {
		for (let i=0; i < list.length; i++) {
			if (list[i].uid === target.uid) {
				list.splice(i, 1);
				break;
			}
		}
	}

	isRemove || list.unshift({
		uid: target.uid,
		name: target.name,
		updated_at: target.updated_at || (target as Gist).created_at,
	});

	return database.put('owner', userid, list);
}

/**
 * Format a Gist for API response
 * @NOTE Matches existing `svelte.dev` Gist output
 */
export function output(item: Gist) {
	const { uid, name, userid, files } = item;
	return { uid, owner:userid, name, files };
}
