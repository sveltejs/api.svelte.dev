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

export async function deconflict(gistid: string) {
	const exists = await database.has('gist', gistid as GistID);
	return !exists;
}

export function lookup(gistid: GistID) {
	return database.get('gist', gistid);
}

/** Create a new Gist for the User */
export async function insert(input: Partial<Gist>, userid: User.UserID): Promise<Gist> {
	const gist: Gist = {
		uid: await keys.unique_uid(deconflict),
		userid,
		name: input.name || '',
		files: input.files || [],
		created_at: Date.now()
	};

	await database.put('gist', gist.uid, gist);

	// synchronize the owner's list of gists
	await sync(userid, gist);

	// return the new item
	return gist;
}

/** Update the name and/or files for an existing Gist */
export async function update(values: Gist, changes: Gist): Promise<Gist> {
	// carefully choose updated keys
	if ('name' in changes) values.name = changes.name;
	if ('files' in changes) values.files = changes.files;

	values.updated_at = Date.now();

	// update the gist with its new values
	await database.put('gist', values.uid, values);

	// synchronize the owner's list of gists
	await sync(values.userid, values);

	// return the updated item
	return values;
}

/** Destroy an existing Gist record */
export async function destroy(gist: Gist) {
	// remove the gist record itself
	await database.remove('gist', gist.uid);

	// synchronize the owner's list of gists
	await sync(gist.userid, gist, true);
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
export function output(gist: Gist) {
	const { uid, name, userid, files } = gist;
	return { uid, owner: userid, name, files };
}
