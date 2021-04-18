import * as TodoList from '../models/todolist';

import type { Handler } from 'worktop';
import type { Params } from 'worktop/request';
import type { TodoID, GuestID } from '../models/todolist';

type ParamsUserID = Params & { userid: GuestID };

// GET /todos/:userid
export const list: Handler<ParamsUserID> = async (req, res) => {
	const todos = await TodoList.lookup(req.params.userid);
	if (todos) res.send(200, todos);
	else res.send(404, { message: 'Todo list not found' });
};

// POST /gists/:userid
export const create: Handler<ParamsUserID> = async (req, res) => {
	const input = await req.body<{ text: string }>();
	if (!input) return res.send(400, 'Missing request body');

	const todo = await TodoList.insert(req.params.userid, input.text);

	if (todo) res.send(201, todo);
	else res.send(500, { message: 'Error creating todo' });
};

// PATCH /gists/:userid/:uid
export const update: Handler = async (req, res) => {
	const { userid, uid } = req.params;

	const input = await req.body<{ text?: string, done?: boolean }>();
	if (!input) return res.send(400, 'Missing request body');

	const todo = await TodoList.update(userid, uid as TodoID, input);

	if (todo) res.send(200, todo);
	else res.send(500, { message: 'Error updating todo' });
};

// DELETE /gists/:userid/:uid
export const destroy: Handler = async (req, res) => {
	const { userid, uid } = req.params;

	if (await TodoList.destroy(userid, uid as TodoID)) res.send(200, {});
	else res.send(500, { message: 'Error deleting todo' });
};
