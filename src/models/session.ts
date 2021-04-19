import * as User from './user';
import { toError } from '../utils';
import * as database from '../utils/database';
import * as cookies from '../utils/cookies';
import * as keys from '../utils/keys';

// types
import type { Handler } from 'worktop';
import type { UID } from 'worktop/utils';
import type { ServerResponse } from 'worktop/response';
import type { ServerRequest } from 'worktop/request';
import type { UserID } from './user';

export type SessionID = UID<32>;

export interface Session {
	uid: SessionID;
	userid: UserID;
	expires: TIMESTAMP;
}

/** Create new `SessionID` value */
export const toUID = () => keys.gen(32);

/** Find a Session by its public ID value */
export async function lookup(uid: SessionID) {
	return database.get('session', uid);
}

/** Create a new Session for the User */
export async function insert(user: User.User): Promise<Session | void> {
	try {
		const values: Session = {
			// wait until have unique GistID
			uid: await keys.until(toUID, lookup),
			userid: user.uid,
			// convert to milliseconds
			expires: Date.now() + cookies.EXPIRES * 1000
		};

		// exit early if could not save new gist record
		if (!await database.put('session', values.uid, values)) return;

		// return the new item
		return values;
	} catch (err) {
		console.error('session.insert ::', err);
	}
}

/** Destroy an existing Session document */
export async function destroy(item: Session): Promise<Session | void> {
	try {
		const bool = await database.remove('session', item.uid);
		if (bool) return item; // return the deleted item
	} catch (err) {
		console.error('session.destroy ::', err);
	}
}

/** Parse the "Cookie" request header; attempt valid `Session` -> `User` lookup */
export async function identify(req: ServerRequest, res: ServerResponse): Promise<User.User | void> {
	const cookie = req.headers.get('cookie');
	if (!cookie) return toError(res, 401, 'Missing cookie header');

	const sid = cookies.parse(cookie);
	if (!sid) return toError(res, 401, 'Invalid cookie value');

	const session = await lookup(sid);
	if (!session) return toError(res, 401, 'Invalid cookie token');

	if (Date.now() >= session.expires) {
		await database.remove('session', session.uid);
		return toError(res, 401, 'Expired session');
	}

	const user = await User.lookup(session.userid);
	if (!user || user.uid !== session.userid) {
		return toError(res, 401, 'Invalid session');
	}

	return user;
}

export type AuthorizedRequest = ServerRequest & { user: User.User, session: Session };
export type AuthorizedHandler = (req: AuthorizedRequest, res: ServerResponse) => Promise<Response|void>;

/**
 * Authentication Middleware
 * Only run `handler` if authenticated / valid Cookie.
 * Guarantees `User` document as `req.user` to `handler`, else error.
 */
export function authenticate(handler: AuthorizedHandler): Handler {
	return async function (req, res) {
		try {
			const user = await identify(req, res);
			if (!user) return; // response sent
			(req as AuthorizedRequest).user = user;
			return handler(req as AuthorizedRequest, res);
		} catch (err) {
			toError(res, err.statusCode || 500, err.data)
		}
	};
}
