import * as cookie from 'cookie';

import type { SessionID } from '../models/session';

export interface Cookie {
	sid: SessionID;
}

// Expires in 1 year (seconds)
export const EXPIRES = 86400 * 365;

export function isCookie(item: Cookie | Record<string, string>): item is Cookie {
	return item && typeof item.sid === 'string';
}

export function parse(value: string): SessionID | false {
	const item = cookie.parse(value);
	return isCookie(item) && item.sid;
}

export function serialize(value: SessionID | null): string {
	return cookie.serialize('sid', value || '', {
		path: '/',
		domain: 'svelte.dev',
		maxAge: value ? EXPIRES : -1,
		httpOnly: true,
		secure: true,
	});
}
