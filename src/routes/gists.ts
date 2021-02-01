import * as Gist from '../models/gist';
import * as Session from '../models/session';
import * as User from '../models/user';

import type { GistID } from '../models/gist';

// GET /gists
export const list = Session.authenticate(async (req, res) => {
	// already transformed and sorted by recency
	res.send(200, await User.gists(req.user.uid));
});


// POST /gists
export const create = Session.authenticate(async (req, res) => {
	const input = req.body;
	// TODO: validate name & files
	const name = (input.name || '').trim();
	const files = [].concat(input.files || []);

	const item = await Gist.insert({ name, files }, req.user);
	if (item) res.send(201, Gist.output(item));
	else res.send(500, 'Error creating gist');
});


// GET /gists/:uid
export const show = Session.authenticate(async (req, res) => {
	const item = await Gist.lookup(req.params.uid as GistID);
	if (item) res.send(200, Gist.output(item));
	else res.send(404, 'Gist not found');
});


// PUT /gists/:uid
export const update = Session.authenticate(async (req, res) => {
	const item = await Gist.lookup(req.params.uid as GistID);
	if (!item) return res.send(404, 'Gist not found');

	if (req.user.uid !== item.userid) {
		return res.send(403, 'Gist does not belong to you');
	}

	const values = await Gist.update(item, req.body);
	if (!values) return res.send(500, 'Error updating gist values');

	res.send(200, Gist.output(values));
});


// DELETE /gists/:uid
export const destroy = Session.authenticate(async (req, res) => {
	const item = await Gist.lookup(req.params.uid as GistID);
	if (!item) return res.send(404, 'Gist not found');

	if (req.user.uid !== item.userid) {
		return res.send(403, 'Gist does not belong to you');
	}

	const success = await Gist.destroy(item);
	if (!success) return res.send(500, 'Error destroying gist');

	res.send(204);
});
