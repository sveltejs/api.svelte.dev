import { Handler } from "worktop";
import { Params, ServerRequest } from "worktop/request";
import { ServerResponse } from "worktop/response";
import { HttpError } from "./index";

export function handler(fn: Handler): Handler {
	return async (req, res) => {
		try {
			fn(req, res);
		} catch (err) {
			const status = (err as HttpError).statusCode || 500;
			const message = (err as HttpError).message;

			res.send(status, { status, message });
		}
	};
}
