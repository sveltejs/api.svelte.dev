import type { UID } from 'worktop/utils';
import type { UserID } from './user';

export type SessionID = UID<36>;

export interface Session {
	sessionid: SessionID;
	userid: UserID;
	expires: TIMESTAMP;
}