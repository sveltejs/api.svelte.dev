import type { KV } from "worktop/kv";

declare const DOCS: KV.Namespace;

export function list(
	project: string,
	type: string,
	version: string,
	full: boolean
): Promise<string> {
	return DOCS.get(`${project}@${version}:${type}:${full ? "content" : "list"}`);
}

export function entry(
	project: string,
	type: string,
	slug: string,
	version: string
): Promise<string> {
	return DOCS.get(`${project}@${version}:${type}:${slug}`);
}
