import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';

const isDev = !!process.env.ROLLUP_WATCH;

/**
 * @type {import('rollup').RollupWatchOptions}
 */
const config = {
	input: 'src/index.ts',
	output: {
		format: 'esm',
		file: 'build/index.js',
		sourcemap: isDev,
	},
	plugins: [
		replace({
			'process.env.SELF_API': isDev ? 'http://localhost:8787' : 'https://api.svelte.dev'
		}),
		resolve({
			mainFields: ['worker', 'browser', 'module', 'jsnext', 'main'],
			extensions: ['.ts', '.mjs', '.js', '.json'],
		}),
		commonjs({
			//
		}),
		typescript({
			//
		})
	],
	watch: {
		clearScreen: false
	}
}

export default config;
