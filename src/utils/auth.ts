import { Handler } from 'worktop';
import { HttpError } from './error';

declare var SECRET: string;

export function authenticate(handler: Handler): Handler {
	return function (req, res) {
		if (req.headers.get('authorization') !== `Basic ${SECRET}`) {
			throw new HttpError('Unauthorized', 401);
		}

		return handler(req, res);
	};
}