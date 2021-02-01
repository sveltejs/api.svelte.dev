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
