import * as github from '../utils/github';

import type { Handler } from 'worktop/router';

// GET /auth/login
export const login: Handler = function (req, res) {
	const Location = github.authorize();
	res.send(302, Location, { Location });
}
