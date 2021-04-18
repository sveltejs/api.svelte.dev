import * as Gist from '../models/gist';
import * as Session from '../models/session';
import * as User from '../models/user';
import { toError } from '../utils';

import type { Handler } from 'worktop';
import type { GistID } from '../models/gist';

// GET /gists
export const list = Session.authenticate(async (req, res) => {
	// already transformed and sorted by recency
	res.send(200, await User.gists(req.user.uid));
});


// POST /gists
export const create = Session.authenticate(async (req, res) => {
	const input = await req.body<Partial<Gist.Gist>>();
	if (!input) return toError(res, 400, 'Missing request body');

	// TODO: validate name & files
	const name = (input.name || '').trim();
	const files = ([] as Gist.File[]).concat(input.files || []);

	const item = await Gist.insert({ name, files }, req.user);
	if (item) res.send(201, Gist.output(item));
	else toError(res, 500, 'Error creating gist');
});


// GET /gists/:uid
export const show: Handler = async (req, res) => {
	const item = await Gist.lookup(req.params.uid as GistID);
	if (item) res.send(200, Gist.output(item));
	else toError(res, 404, 'Gist not found');
};


// PUT /gists/:uid
export const update = Session.authenticate(async (req, res) => {
	const item = await Gist.lookup(req.params.uid as GistID);
	if (!item) return toError(res, 404, 'Gist not found');

	if (req.user.uid !== item.userid) {
		return toError(res, 403, 'Gist does not belong to you');
	}

	const input = await req.body<Gist.Gist>();
	if (!input) return toError(res, 400, 'Missing request body');

	const values = await Gist.update(item, input);
	if (!values) return toError(res, 500, 'Error updating gist values');

	res.send(200, Gist.output(values));
});


// DELETE /gists/:uid
export const destroy = Session.authenticate(async (req, res) => {
	const item = await Gist.lookup(req.params.uid as GistID);
	if (!item) return toError(res, 404, 'Gist not found');

	if (req.user.uid !== item.userid) {
		return toError(res, 403, 'Gist does not belong to you');
	}

	const success = await Gist.destroy(item);
	if (!success) return toError(res, 500, 'Error destroying gist');

	res.send(204);
});
