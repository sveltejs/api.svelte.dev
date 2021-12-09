import { handler } from '../utils/handler';
import * as database from '../utils/database';
import * as keys from '../utils/keys';
import { SessionID } from '../models/session';
import * as User from '../models/user';
import { HttpError } from '../utils/error';
import { authenticate } from '../utils/auth';

// Expires in 1 year (seconds)
const EXPIRES = 86400 * 365;

const get_uid = () => keys.gen(32);
const lookup = async (sessionid: SessionID) => {
	const exists = await database.has('session', sessionid);
	return !exists;
}

// POST /session
export const create = handler(authenticate(async (req, res) => {
	const user = await req.body<User.User>();
	if (!user) throw new HttpError('Missing body', 400);

	const sessionid: SessionID = await keys.until(get_uid, lookup);
	const expires = Date.now() + EXPIRES * 1000;

	// create or update the user object
	await User.upsert(user);

	// create a session
	await database.put('session', sessionid, {
		sessionid,
		userid: user.id,
		expires
	});

	res.send(200, { sessionid, expires });
}));

// GET /session/:sessionid
export const show = handler(authenticate(async (req, res) => {
	const { userid } = await database.get('session', req.params.sessionid as SessionID);
	const user = await database.get('user', userid);

	res.send(200, {
		user: {
			id: user.id,
			name: user.name,
			username: user.username,
			avatar: user.avatar
		}
	});
}));

// DELETE /session/:sessionid
export const destroy = handler(authenticate(async (req, res) => {
	await database.remove('session', req.params.sessionid as SessionID);
	res.send(204);
}));