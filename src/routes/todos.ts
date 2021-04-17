import * as TodoList from '../models/todolist';

import type { Handler } from 'worktop';
import type { Todo, TodoID, GuestID } from '../models/todolist';

// GET /todos/:userid
export const list: Handler = async (req, res) => {
	const todos = await TodoList.lookup(req.params.userid as GuestID);
	if (todos) res.send(200, todos);
	else res.send(404, 'Todo list not found');
};

// POST /gists/:userid
export const create: Handler = async (req, res) => {
	const input = await req.body<{ text: string }>();
	if (!input) return res.send(400, 'Missing request body');

	const todo = await TodoList.insert(req.params.userid as GuestID, input.text);

	if (todo) res.send(201, todo);
	else res.send(500, 'Error creating todo');
};

// PATCH /gists/:userid/:uid
export const update: Handler = async (req, res) => {
	const input = await req.body<{ text?: string, done?: boolean }>();
	if (!input) return res.send(400, 'Missing request body');

	const success = await TodoList.update(req.params.userid as GuestID, req.params.uid as TodoID, input);

	if (success) res.send(204);
	else res.send(500, 'Error updating todo');
};

// PATCH /gists/:userid/:uid
export const destroy: Handler = async (req, res) => {
	const success = await TodoList.destroy(req.params.userid as GuestID, req.params.uid as TodoID);

	if (success) res.send(204);
	else res.send(500, 'Error deleting todo');
};