import * as cookie from 'cookie';

import type { SessionID } from '../models/session';

export interface Cookie {
	sid: SessionID;
}

export function isCookie(item: Cookie | Record<string, string>): item is Cookie {
	return item && typeof item.sid === 'string';
}

export function parse(value: string): SessionID | false {
	const item = cookie.parse(value);
	return isCookie(item) && item.sid;
}

// TODO: stringify / create cookie
