import type { ServerResponse } from "worktop/response";

export function toError(
	res: ServerResponse,
	status: number,
	message: string,
	headers: Record<string, string> = {}
) {
	for (const key in headers) {
		res.setHeader(key, headers[key]);
	}

	res.send(status, { status, message });
}
