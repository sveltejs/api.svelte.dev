import * as TodoList from '../models/todolist';
import { HttpError } from '../utils/error';

import type { Handler } from 'worktop';
import type { Params } from 'worktop/request';
import type { TodoID, GuestID } from '../models/todolist';
import { handler } from '../utils/handler';

type ParamsUserID = Params & { userid: GuestID };

// GET /todos/:userid
export const list: Handler<ParamsUserID> = handler(async (req, res) => {
	const todos = await TodoList.lookup(req.params.userid);
	res.send(200, todos);
});

// POST /gists/:userid
export const create: Handler<ParamsUserID> = handler(async (req, res) => {
	const input = await req.body<{ text: string }>();
	if (!input) throw new HttpError('Missing request body', 400);

	const todo = await TodoList.insert(req.params.userid, input.text);

	res.send(201, todo);
});

// PATCH /gists/:userid/:uid
export const update: Handler = handler(async (req, res) => {
	const { userid, uid } = req.params;

	const input = await req.body<{ text?: string, done?: boolean }>();
	if (!input) throw new HttpError('Missing request body', 400);

	const todo = await TodoList.update(userid, uid as TodoID, input);

	res.send(200, todo);
});

// DELETE /gists/:userid/:uid
export const destroy: Handler = handler(async (req, res) => {
	const { userid, uid } = req.params;

	await TodoList.destroy(userid, uid as TodoID);
	res.send(200, {}); // TODO should be a 204, no?
});
