import { createClient } from '@supabase/supabase-js';
import { HttpError } from '../utils/error';
import { handler } from '../utils/handler';

import type { Handler } from 'worktop';
import type { Params } from 'worktop/request';

type ParamsUserID = Params & { guestid: string };

declare const SUPABASE_URL: string;
declare const SUPABASE_KEY: string;

const client = createClient(SUPABASE_URL, SUPABASE_KEY, {
	// global fetch is sensitive to context, so we need to do this silliness
	fetch: (init, info) => fetch(init, info)
});

// GET /todos/:guestid
export const list: Handler<ParamsUserID> = handler(async (req, res) => {
	const { data, error } = await client.from('todo')
		.select('uid,text,done')
		.eq('guestid', req.params.guestid);

	if (error) throw new HttpError(error.message, 500);
	res.send(200, data);
});

// POST /todos/:guestid
export const create: Handler<ParamsUserID> = handler(async (req, res) => {
	const body = await req.body<{ text: string }>();
	if (!body) throw new HttpError('Missing request body', 400);

	const { data, error } = await client.from('todo')
		.insert([
			{
				guestid: req.params.guestid,
				text: body.text
			}
		]);

	if (error) throw new HttpError(error.message, 500);
	res.send(201, (data as any[])[0]);
});

// PATCH /todos/:guestid/:uid
export const update: Handler = handler(async (req, res) => {
	const { guestid, uid } = req.params;

	const body = await req.body<{ text?: string, done?: boolean }>();

	if (!body) throw new HttpError('Missing request body', 400);
	if (!('text' in body) || !('done' in body)) throw new HttpError('Malformed request body', 400);

	const { data, error } = await client
		.from('todo')
		.update({
			text: body.text,
			done: body.done
		})
		.eq('uid', uid)
		.eq('guestid', guestid);

	if (error) throw new HttpError(error.message, 500);
	res.send(200, data);
});

// DELETE /todos/:guestid/:uid
export const destroy: Handler = handler(async (req, res) => {
	const { guestid, uid } = req.params;

	const { error } = await client
		.from('todo')
		.delete()
		.eq('uid', uid)
		.eq('guestid', guestid);

	if (error) throw new HttpError(error.message, 500);
	res.send(204);
});
