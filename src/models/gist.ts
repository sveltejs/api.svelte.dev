import type { UserID } from './user';

export interface File {
	name: string;
	source: string;
}

export type GistID = Fixed.String<36>;

export interface Gist {
	uid: GistID;
	userid: UserID;
	name: string;
	files: File[];
	created_at: TIMESTAMP;
	updated_at?: TIMESTAMP;
}
