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
	gistid: GistID;
	userid: UserID;
	name: string;
	files: File[];
	created_at: TIMESTAMP;
	updated_at?: TIMESTAMP;
}

/** Create new `GistID` value */
export const toUID = () => keys.gen(36);

/** Find a Gist by its public ID value */
export async function lookup(gistid: GistID) {
	return database.get('gist', gistid);
}

/** Create a new Gist for the User */
export async function insert(input: Partial<Gist>, userid: User.UserID): Promise<Gist> {
	const values: Gist = {
		// wait until have unique GistID
		gistid: await keys.until(toUID, lookup),
		name: input.name || '',
		files: input.files || [],
		userid,
		created_at: Date.now()
	};

	await database.put('gist', values.gistid, values);

	// synchronize the owner's list of gists
	await sync(userid, values);

	// return the new item
	return values;
}

/** Update the name and/or files for an existing Gist */
export async function update(values: Gist, changes: Gist): Promise<Gist> {
	// carefully choose updated keys
	values.name = changes.name || values.name;
	values.files = changes.files || values.files;
	values.updated_at = Date.now();

	// update the gist with its new values
	await database.put('gist', values.gistid, values);

	// synchronize the owner's list of gists
	await sync(values.userid, values);

	// return the updated item
	return values;
}

/** Destroy an existing Gist record */
export async function destroy(gist: Gist) {
	// remove the gist record itself
	await database.remove('gist', gist.gistid);

	// synchronize the owner's list of gists
	await sync(gist.userid, gist, true);
}

/** Synchronize UserGists list for User/Owner */
export async function sync(userid: UserID, target: Gist | User.UserGist, isRemove = false) {
	const list = await User.gists(userid);

	if (target && target.gistid) {
		for (let i=0; i < list.length; i++) {
			if (list[i].gistid === target.gistid) {
				list.splice(i, 1);
				break;
			}
		}
	}

	isRemove || list.unshift({
		gistid: target.gistid,
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
	const { gistid, name, userid, files } = gist;
	return { gistid, owner:userid, name, files };
}
