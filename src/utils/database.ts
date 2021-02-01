import type { Gist, GistID } from '../models/gist';
import type { Session, SessionID } from '../models/session';
import type { User, UserGist, UserID } from '../models/user';

export interface Identifiers {
	gist: GistID;
	owner: UserID;
	session: SessionID;
	user: UserID;
}

export interface Models {
	gist: Gist;
	owner: UserGist[];
	session: Session;
	user: User;
}
