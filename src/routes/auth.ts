import devalue from 'devalue';
import { HttpError } from '../utils/error';
import * as github from '../utils/github';
import * as cookies from '../utils/cookies';
import * as Session from '../models/session';
import * as User from '../models/user';
import { handler } from '../utils/handler';

import type { Handler } from 'worktop';

// GET /auth/login
export const login: Handler = function (req, res) {
	const Location = github.authorize();
	return Response.redirect(Location, 302);
}

// GET /auth/callback
export const callback: Handler = handler(async function (req, res) {
	const code = req.query.get('code') || '';
	if (!code) throw new HttpError('Missing "code" parameter', 400);

	// Trade "code" for "access_token"
	const { token, profile } = await github.exchange(code);

	let user = await User.lookup(profile.id);

	if (user) {
		user = await User.update(user, profile, token);
	} else {
		user = await User.insert(profile, token);
	}

	const session = await Session.insert(user);

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
})

// GET /auth/logout
export const logout = handler(Session.authenticate(async (req, res) => {
	await Session.destroy(req.session);
	res.send(204);
}));
