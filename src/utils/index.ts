import type { ServerResponse } from 'worktop/response';

export function toError(res: ServerResponse, status: number, message: string) {
	res.send(status, { status, message });
}

export class HttpError extends Error {
	statusCode: number;

	constructor(message: string, statusCode: number) {
		super(message);
		this.statusCode = statusCode;
	}
}