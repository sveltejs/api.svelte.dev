import * as User from './user';
import * as database from '../utils/database';
import * as cookies from '../utils/cookies';
import * as keys from '../utils/keys';

// types
import type { UserID } from './user';
import type { Handler } from 'worktop';
import type { ServerResponse } from 'worktop/response';
import type { ServerRequest } from 'worktop/request';

export type SessionID = Fixed.String<32>;

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

/** Parse the "Cookie" request header; attempt valid `Session` -> `User` lookup */
export async function identify(req: ServerRequest, res: ServerResponse): Promise<User.User | void> {
	const cookie = req.headers.get('cookie');
	if (!cookie) return res.send(401, 'Missing cookie header');

	const sid = cookies.parse(cookie);
	if (!sid) return res.send(401, 'Invalid cookie value');

	const session = await lookup(sid);
	if (!session) return res.send(401, 'Invalid cookie token');

	if (Date.now() >= session.expires) {
		await database.remove('session', session.uid);
		return res.send(401, 'Expired session');
	}

	const user = await User.lookup(session.userid);
	if (!user || user.uid !== session.userid) {
		return res.send(401, 'Invalid session');
	}

	return user;
}

export type AuthorizedRequest = ServerRequest & { user: User.User };
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
			res.send(err.statusCode || 500, err.data);
		}
	};
}
