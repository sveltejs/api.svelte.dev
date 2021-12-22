import { createClient } from '@supabase/supabase-js';
import { HttpError, handler } from '../utils';

import type { Handler } from 'worktop';
import type { Params } from 'worktop/request';

type TodoListParams = Params & { guestid: string };
type TodoParams = Params & { guestid: string; uid: string };

declare const SUPABASE_URL: string;
declare const SUPABASE_KEY: string;

const client = createClient(SUPABASE_URL, SUPABASE_KEY, {
	// global fetch is sensitive to context, so we need to do this silliness
	fetch: (init, info) => fetch(init, info)
});

const todos = () => client.from('todo');

// GET /todos/:guestid
export const list: Handler<TodoListParams> = handler(async (req, res) => {
	const { data, error } = await todos()
		.select('uid,text,done')
		.eq('guestid', req.params.guestid)
		.order('created_at');

	if (error) throw new HttpError(error.message, 500);
	res.send(200, data);
});

// POST /todos/:guestid
export const create: Handler<TodoListParams> = handler(async (req, res) => {
	const body = await req.body<{ text: string }>();
	if (!body) throw new HttpError('Missing request body', 400);

	const { data, error } = await todos().insert([
		{
			guestid: req.params.guestid,
			text: body.text
		}
	]);

	if (error) throw new HttpError(error.message, 500);
	res.send(201, (data as any[])[0]);
});

// PATCH /todos/:guestid/:uid
export const update: Handler<TodoParams> = handler(async (req, res) => {
	const body = await req.body<{ text?: string, done?: boolean }>();
	if (!body) throw new HttpError('Missing request body', 400);

	const updated: { text?: string, done?: boolean } = {};
	if ('text' in body) updated.text = body.text;
	if ('done' in body) updated.done = body.done;

	const { data, error } = await todos()
		.update(updated)
		.eq('uid', req.params.uid)
		.eq('guestid', req.params.guestid);

	if (error) throw new HttpError(error.message, 500);
	res.send(200, data);
});

// DELETE /todos/:guestid/:uid
export const destroy: Handler<TodoParams> = handler(async (req, res) => {
	const { error } = await todos()
		.delete()
		.eq('uid', req.params.uid)
		.eq('guestid', req.params.guestid);

	if (error) throw new HttpError(error.message, 500);
	res.send(200, {}); // TODO should really be a 204, but need to update the template first
});
