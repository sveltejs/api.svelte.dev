import * as Docs from "../models/docs";

import type { Handler } from "worktop";
import type { Params } from "worktop/request";
import { handler } from "../utils/handler";

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

	const docs = await Docs.list(project, type, version, full);
	res.send(200, docs, headers);
});

// GET /docs/:project/:type/:slug(?version=beta)
export const entry: Handler<ParamsDocsEntry> = handler(async (req, res) => {
	const { project, type, slug } = req.params;
	const version = req.query.get("version") || "latest";

	const entry = await Docs.entry(project, type, slug, version);
	res.send(200, entry, headers);
});
