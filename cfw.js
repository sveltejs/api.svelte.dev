const VARS = process.env;

/**
 * @type {import('cfw').Config}
 */
module.exports = {
	profile: 'svelte',
	name: 'svelte-api',
	entry: 'index.ts',
	routes: [
		'api.svelte.dev/*'
	],
	globals: {
		DATAB: `KV:${VARS.CLOUDFLARE_NAMESPACEID}`,
		DOCS: `KV:${VARS.CLOUDFLARE_NAMESPACEID_DOCS}`,
	}
}
