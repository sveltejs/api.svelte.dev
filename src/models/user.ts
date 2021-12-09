import * as database from '../utils/database';

import type { Gist } from './gist';

export type UserID = string;

export interface User {
	/** GitHub ID */
	id: UserID;
	/** GitHub username */
	username: string;
	/** First + Last */
	name: string;
	/** GitHub avatar */
	avatar: string;
	/** GitHub oAuth token */
	token: GitHub.AccessToken;
	created_at?: TIMESTAMP;
	updated_at?: TIMESTAMP;
}

// The `Gist` attributes saved for `owner` relationship
export type UserGist = Pick<Gist, 'uid'|'name'|'updated_at'>;

/** Get all Gists belonging to UserID */
export function gists(userid: UserID): Promise<UserGist[]> {
	return database.get('owner', userid).then(arr => arr || []);
}

export async function upsert(user: Omit<Omit<User, 'created_at'>, 'updated_at'>) {
	let record;

	try {
		record = await database.get('user', user.id);
	} catch {
		record = {};
	}

	const now = Date.now();

	await database.put('user', user.id, {
		created_at: now,
		...record,
		...user,
		updated_at: now
	});
}