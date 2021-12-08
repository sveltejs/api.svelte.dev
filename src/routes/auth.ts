import devalue from 'devalue';
import { HttpError, toError } from '../utils';
import * as github from '../utils/github';
import * as cookies from '../utils/cookies';
import * as Session from '../models/session';
import * as User from '../models/user';

import type { Handler } from 'worktop';

// GET /auth/login
export const login: Handler = function (req, res) {
	const Location = github.authorize();
	return Response.redirect(Location, 302);
}

// GET /auth/callback
export const callback: Handler = async function (req, res) {
	try {
		const code = req.query.get('code') || '';
		if (!code) throw new HttpError('Missing "code" parameter', 400);

		// Trade "code" for "access_token"
		const { token, profile } = await github.exchange(code);

		let user = await User.lookup(profile.id);

		if (user) {
			const item = await User.update(user, profile, token);
			if (!item) return toError(res, 500, 'Error updating user document');
			user = item;
		} else {
			const item = await User.insert(profile, token);
			if (!item) return toError(res, 500, 'Error creating user document');
			user = item;
		}

		const session = await Session.insert(user);
		if (!session) return toError(res, 500, 'Error creating user session');

		res.setHeader('Content-Type', 'text/html;charset=utf-8');
		res.setHeader('Set-Cookie', cookies.serialize(session.uid));

		// sanitize output, hide token
		const output = User.output(user);

		res.end(`
			<script>
				window.opener.postMessage({
					user: ${devalue(output)}
				}, window.location.origin);
			</script>
		`);
	} catch (err) {
		toError(res, (err as HttpError).statusCode || 500, (err as HttpError).message);
	}
}

// GET /auth/logout
export const logout = Session.authenticate(async (req, res) => {
	try {
		await Session.destroy(req.session);
		res.send(204);
	} catch {
		toError(res, 500, 'Error destroying session');
	}
});
