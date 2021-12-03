import type { ServerResponse } from "worktop/response";

export function toError(res: ServerResponse, status: number, message: string) {
	res.send(status, { status, message });
}
