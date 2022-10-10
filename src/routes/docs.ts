import { handler, HttpError } from "../utils";

import type { Handler } from "worktop";
import type { Params } from "worktop/request";
import type { KV } from "worktop/kv";

declare const DOCS: KV.Namespace;

type ParamsDocsList = Params & { project: string; type: string };
type ParamsDocsEntry = Params & { project: string; type: string; slug: string };

const headers = {
	'content-type': 'application/json'
};

// GET /docs/:project/:type(?version=beta&content)
export const list: Handler<ParamsDocsList> = handler(async (req, res) => {
	const { project, type } = req.params;
	const version = req.query.get("version") || "latest";
	const full = req.query.get("content") !== null;

	const docs = await DOCS.get(`${project}@${version}:${type}:${full ? "content" : "list"}`);
	if (!docs) throw new HttpError('Missing document', 404);
	return res.send(200, docs, headers);
});

// GET /docs/:project/:type/:slug(?version=beta)
export const entry: Handler<ParamsDocsEntry> = handler(async (req, res) => {
	const { project, type, slug } = req.params;
	const version = req.query.get("version") || "latest";

	const entry = await DOCS.get(`${project}@${version}:${type}:${slug}`);
	if (!entry) throw new HttpError('Missing document', 404);
	return res.send(200, entry, headers);
});
