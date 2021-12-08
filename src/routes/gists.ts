import * as Gist from '../models/gist';
import * as Session from '../models/session';
import * as User from '../models/user';
import { HttpError, toError } from '../utils';

import type { Handler } from 'worktop';
import type { GistID } from '../models/gist';

// GET /gists
export const list = Session.authenticate(async (req, res) => {
	// already transformed and sorted by recency
	res.send(200, await User.gists(req.user.uid));
});

// POST /gists
export const create = Session.authenticate(async (req, res) => {
	try {
		const input = await req.body<Partial<Gist.Gist>>();
		if (!input) throw new HttpError('Missing request body', 400);

		// TODO: validate name & files
		const name = (input.name || '').trim();
		const files = ([] as Gist.File[]).concat(input.files || []);

		const item = await Gist.insert({ name, files }, req.user);
		res.send(201, Gist.output(item));
	} catch (err) {
		return toError(res, (err as HttpError).statusCode, (err as HttpError).message);
	}
});

// GET /gists/:uid
export const show: Handler = async (req, res) => {
	try {
		const item = await Gist.lookup(req.params.uid as GistID);
		res.send(200, Gist.output(item));
	} catch {
		toError(res, 404, 'Gist not found')
	}
};

// PUT /gists/:uid
export const update = Session.authenticate(async (req, res) => {
	try {
		const item = await Gist.lookup(req.params.uid as GistID);

		if (req.user.uid !== item.userid) {
			throw new HttpError('Gist does not belong to you', 403);
		}

		const input = await req.body<Gist.Gist>();
		if (!input) throw new HttpError('Missing request body', 400);

		const values = await Gist.update(item, input);

		res.send(200, Gist.output(values));
	} catch (err) {
		toError(res, (err as HttpError).statusCode, (err as HttpError).message);
	}
});

// DELETE /gists/:uid
export const destroy = Session.authenticate(async (req, res) => {
	try {
		const item = await Gist.lookup(req.params.uid as GistID);

		if (req.user.uid !== item.userid) {
			throw new HttpError('Gist does not belong to you', 403);
		}

		await Gist.destroy(item);

		res.send(204);
	} catch (err) {
		toError(res, (err as HttpError).statusCode, (err as HttpError).message);
	}
});
