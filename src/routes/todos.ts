import * as TodoList from '../models/todolist';
import { HttpError, toError } from '../utils';

import type { Handler } from 'worktop';
import type { Params } from 'worktop/request';
import type { TodoID, GuestID } from '../models/todolist';

type ParamsUserID = Params & { userid: GuestID };

// GET /todos/:userid
export const list: Handler<ParamsUserID> = async (req, res) => {
	try {
		const todos = await TodoList.lookup(req.params.userid);
		if (todos) res.send(200, todos);
	} catch (err) {
		toError(res, (err as HttpError).statusCode || 500, (err as HttpError).message);
	}
};

// POST /gists/:userid
export const create: Handler<ParamsUserID> = async (req, res) => {
	try {
		const input = await req.body<{ text: string }>();
		if (!input) throw new HttpError('Missing request body', 400);

		const todo = await TodoList.insert(req.params.userid, input.text);

		res.send(201, todo);
	} catch (err) {
		toError(res, (err as HttpError).statusCode || 500, (err as HttpError).message);
	}
};

// PATCH /gists/:userid/:uid
export const update: Handler = async (req, res) => {
	try {
		const { userid, uid } = req.params;

		const input = await req.body<{ text?: string, done?: boolean }>();
		if (!input) throw new HttpError('Missing request body', 400);

		const todo = await TodoList.update(userid, uid as TodoID, input);

		res.send(200, todo);
	} catch (err) {
		toError(res, (err as HttpError).statusCode || 500, (err as HttpError).message);
	}
};

// DELETE /gists/:userid/:uid
export const destroy: Handler = async (req, res) => {
	const { userid, uid } = req.params;

	try {
		await TodoList.destroy(userid, uid as TodoID);
		res.send(200, {});
	} catch (err) {
		toError(res, 500, 'Error deleting todo');
	}
};
