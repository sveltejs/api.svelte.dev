import type { UserID } from './user';

export type SessionID = Fixed.String<32>;

export interface Session {
	uid: SessionID;
	userid: UserID;
	expires: TIMESTAMP;
}
