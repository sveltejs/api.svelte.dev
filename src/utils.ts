import type { Handler } from 'worktop';

export function handler(fn: Handler): Handler {
	return async (req, res) => {
		try {
			await fn(req, res);
		} catch (err) {
			const status = (err as HttpError).statusCode || 500;
			const message = (err as HttpError).message;

			if (status >= 500) {
				console.error((err as HttpError).stack);
			}

			res.send(status, { status, message });
		}
	};
}

export class HttpError extends Error {
	statusCode: number;

	constructor(message: string, statusCode: number) {
		super(message);
		this.statusCode = statusCode;
	}
}