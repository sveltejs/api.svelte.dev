import * as Gist from '../models/gist';
import * as User from '../models/user';
import { HttpError } from '../utils/error';

import type { GistID } from '../models/gist';
import type { UserID } from '../models/user';
import { handler } from '../utils/handler';
import { authenticate } from '../utils/auth';

// GET /gists?userid=userid
export const list = handler(authenticate(async (req, res) => {
	const userid = req.query.get('userid') as UserID;
	if (!userid) throw new HttpError('Missing userid', 400);

	res.send(200, await User.gists(userid));
}));

// POST /gists?userid=userid
export const create = handler(authenticate(async (req, res) => {
	const userid = req.query.get('userid') as UserID;
	if (!userid) throw new HttpError('Missing userid', 400);

	const input = await req.body<Partial<Gist.Gist>>();
	if (!input) throw new HttpError('Missing request body', 400);

	// TODO: validate name & files
	const name = (input.name || '').trim();
	const files = ([] as Gist.File[]).concat(input.files || []);

	const item = await Gist.insert({ name, files }, userid);
	res.send(201, Gist.output(item));
}));

// GET /gists/:gistid
export const show = handler(async (req, res) => {
	const item = await Gist.lookup(req.params.gistid as GistID);
	res.send(200, Gist.output(item));
});

// PUT /gists/:gistid
export const update = handler(authenticate(async (req, res) => {
	const userid = req.query.get('userid') as UserID;
	if (!userid) throw new HttpError('Missing userid', 400);

	const item = await Gist.lookup(req.params.gistid as GistID);

	if (userid !== item.userid) {
		throw new HttpError('Gist does not belong to you', 403);
	}

	const input = await req.body<Gist.Gist>();
	if (!input) throw new HttpError('Missing request body', 400);

	const values = await Gist.update(item, input);

	res.send(200, Gist.output(values));
}));

// DELETE /gists/:gistid
export const destroy = handler(authenticate(async (req, res) => {
	const userid = req.query.get('userid') as UserID;
	if (!userid) throw new HttpError('Missing userid', 400);

	const item = await Gist.lookup(req.params.gistid as GistID);

	if (userid !== item.userid) {
		throw new HttpError('Gist does not belong to you', 403);
	}

	await Gist.destroy(item);

	res.send(204);
}));
