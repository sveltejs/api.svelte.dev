import type { UID } from 'worktop/utils';
import type { UserID } from './user';

export type SessionID = UID<32>;

export interface Session {
	sessionid: SessionID;
	userid: UserID;
	expires: TIMESTAMP;
}