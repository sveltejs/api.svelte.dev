import * as database from '../utils/database';

import type { Gist } from './gist';

export type UserID = number;

export interface User {
	/** GitHub ID */
	uid: UserID;
	/** GitHub username */
	username: string;
	/** GitHub avatar */
	avatar: string;
	/** GitHub oAuth token */
	token: string;
	created_at: TIMESTAMP;
	updated_at?: TIMESTAMP;
}

// The `Gist` attributes saved for `owner` relationship
export type UserGist = Pick<Gist, 'uid'|'name'|'updated_at'>;

/** Find a User by its public ID value */
export async function lookup(uid: UserID) {
	return database.get('user', uid);
}

/** Get all Gists belonging to UserID */
export function gists(uid: UserID): Promise<UserGist[]> {
	return database.get('owner', uid).then(arr => arr || []);
}
