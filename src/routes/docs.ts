import * as Docs from "../models/docs";

import type { Handler } from "worktop";
import type { Params } from "worktop/request";

type ParamsDocsList = Params & { project: string; type: string };
type ParamsDocsEntry = Params & { project: string; type: string; slug: string };

// GET /docs/:project/:type(?version=beta&content)
export const list: Handler<ParamsDocsList> = async (req, res) => {
	const { project, type } = req.params;
	const version = req.query.get("version") || "latest";
	const full = req.query.get("content") !== null;

	const docs = await Docs.list(project, type, version, full);

	if (docs) res.send(200, docs);
	else
		res.send(404, {
			message: `'${project}@${version}' '${type}' entry not found.`,
		});
};

// GET /docs/:project/:type/:slug(?version=beta)
export const entry: Handler<ParamsDocsEntry> = async (req, res) => {
	const { project, type, slug } = req.params;
	const version = req.query.get("version") || "latest";

	const entry = await Docs.entry(project, type, slug, version);

	if (entry) res.send(200, entry);
	else
		res.send(404, {
			message: `'${project}@${version}' '${type}' entry for '${slug}' not found.`,
		});
};
