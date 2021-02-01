import devalue from 'devalue';
import * as github from '../utils/github';
import * as cookies from '../utils/cookies';
import * as Session from '../models/session';
import * as User from '../models/user';

import type { Handler } from 'worktop/router';

// GET /auth/login
export const login: Handler = function (req, res) {
	const Location = github.authorize();
	res.send(302, Location, { Location });
}

// GET /auth/callback
export const callback: Handler = async function (req, res) {
	// Trade "code" for "access_token"
	const code = req.query.code as string;
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
