import * as TodoList from '../models/todolist';
import { HttpError } from '../utils/error';

import type { Handler } from 'worktop';
import type { Params } from 'worktop/request';
import type { TodoID, GuestID } from '../models/todolist';
import { handler } from '../utils/handler';

type ParamsUserID = Params & { guestid: GuestID };

// GET /todos/:guestid
export const list: Handler<ParamsUserID> = handler(async (req, res) => {
	const todos = await TodoList.lookup(req.params.guestid);
	res.send(200, todos);
});

// POST /todos/:guestid
export const create: Handler<ParamsUserID> = handler(async (req, res) => {
	const input = await req.body<{ text: string }>();
	if (!input) throw new HttpError('Missing request body', 400);

	const todo = await TodoList.insert(req.params.guestid, input.text);

	res.send(201, todo);
});

// PATCH /todos/:guestid/:todoid
export const update: Handler = handler(async (req, res) => {
	const { guestid, todoid } = req.params;

	const input = await req.body<{ text?: string, done?: boolean }>();
	if (!input) throw new HttpError('Missing request body', 400);

	const todo = await TodoList.update(guestid, todoid as TodoID, input);

	res.send(200, todo);
});

// DELETE /todos/:guestid/:todoid
export const destroy: Handler = handler(async (req, res) => {
	const { guestid, todoid } = req.params;

	await TodoList.destroy(guestid, todoid as TodoID);
	res.send(200, {}); // TODO should be a 204, no?
});
