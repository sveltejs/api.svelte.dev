import devalue from 'devalue';
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
	const code = req.query.get('code') || '';
	if (!code) return res.send(400, 'Missing "code" parameter');

	// Trade "code" for "access_token"
	const payload = await github.exchange(code);
	if (!payload) return res.send(400, 'Error with GitHub login');

	const { token, profile } = payload;

	let user = await User.lookup(profile.id);

	if (user) {
		const item = await User.update(user, profile, token);
		if (!item) return res.send(500, 'Error updating user document');
		user = item;
	} else {
		const item = await User.insert(profile, token);
		if (!item) return res.send(500, 'Error creating user document');
		user = item;
	}

	const session = await Session.insert(user);
	if (!session) return res.send(500, 'Error creating user session');

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
}

// GET /auth/logout
export const logout = Session.authenticate(async (req, res) => {
	if (await Session.destroy(req.session)) res.send(204);
	else res.send(500, 'Error destroying session');
});
