const VARS = process.env;

module.exports = {
	name: 'svelte-api',
	profile: 'svelte',
	routes: [
		'api.svelte.dev/*'
	],
  globals: {
		DATAB: `KV:${VARS.CLOUDFLARE_NAMESPACEID}`,
		GITHUB_CLIENT_ID: `ENV:${VARS.GITHUB_CLIENT_ID}`,
		GITHUB_CLIENT_SECRET: `SECRET:${VARS.GITHUB_CLIENT_SECRET}`,
	},
	build(config, options) {
		// Attach TypeScript config changes
		// NOTICE: All this will be `cfw` built-in
		config.input = config.input.replace(/\.js$/, '.ts');
		options.resolve.extensions = ['.ts', '.mjs', '.js', '.json'];

		config.plugins.push(
			// @ts-ignore - require/default
			require('rollup-plugin-typescript2')(),
			// @ts-ignore - require/default
			require('@rollup/plugin-commonjs')(),
		);
	}
}
