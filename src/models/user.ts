import * as database from '../utils/database';

import type { Gist } from './gist';

export type UserID = number;

export interface User {
	/** GitHub ID */
	uid: UserID;
	/** GitHub username */
	username: string;
	/** First + Last */
	name: string;
	/** GitHub avatar */
	avatar: string;
	/** GitHub oAuth token */
	token: GitHub.AccessToken;
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

/** Create a new User record */
export async function insert(profile: GitHub.User, accesstoken: GitHub.AccessToken): Promise<User> {
	const values: User = {
		uid: profile.id,
		username: profile.login,
		name: profile.name,
		avatar: profile.avatar_url,
		created_at: Date.now(),
		token: accesstoken,
	};

	await database.put('user', values.uid, values);

	// return the new item
	return values;
}

/** Update an existing User document */
export async function update(values: User, profile: GitHub.User, accesstoken: GitHub.AccessToken): Promise<User> {
	// update specific attrs
	values.name = profile.name;
	values.username = profile.login;
	values.avatar = profile.avatar_url;
	values.updated_at = Date.now();
	values.token = accesstoken;

	await database.put('user', values.uid, values);

	// return the new item
	return values;
}

/** Format a User for public display */
export function output(item: User) {
	const { uid, username, name, avatar } = item;
	return { uid, username, name, avatar };
}
