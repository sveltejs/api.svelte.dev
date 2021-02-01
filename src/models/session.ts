import * as keys from '../utils/keys';

import type { UserID } from './user';

export type SessionID = Fixed.String<32>;

export interface Session {
	uid: SessionID;
	userid: UserID;
	expires: TIMESTAMP;
}

/** Create new `SessionID` value */
export const toUID = () => keys.gen(32);
