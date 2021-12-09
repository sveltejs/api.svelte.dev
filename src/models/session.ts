import * as User from './user';
import { HttpError, toError } from '../utils';
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
export async function insert(user: User.User): Promise<Session> {
	const values: Session = {
		// wait until have unique GistID
		uid: await keys.until(toUID, lookup),
		userid: user.uid,
		// convert to milliseconds
		expires: Date.now() + cookies.EXPIRES * 1000
	};

	await database.put('session', values.uid, values);

	// return the new item
	return values;
}

/** Destroy an existing Session document */
export async function destroy(item: Session): Promise<Session> {
	await database.remove('session', item.uid);
	return item; // return the deleted item
}

/** Parse the "Cookie" request header; attempt valid `Session` -> `User` lookup */
export async function identify(req: ServerRequest, res: ServerResponse): Promise<User.User> {
	const cookie = req.headers.get('cookie');
	if (!cookie) throw new HttpError('Missing cookie header', 401);

	const sid = cookies.parse(cookie);
	if (!sid) throw new HttpError('Invalid cookie value', 401);

	const session = await lookup(sid);
	if (!session) throw new HttpError('Invalid cookie token', 401);

	if (Date.now() >= session.expires) {
		await database.remove('session', session.uid);
		throw new HttpError('Expired session', 401);
	}

	const user = await User.lookup(session.userid);
	if (!user || user.uid !== session.userid) {
		throw new HttpError('Invalid session', 401);
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
		(req as AuthorizedRequest).user = await identify(req, res);
		return handler(req as AuthorizedRequest, res);
	};
}
