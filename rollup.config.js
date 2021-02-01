import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';

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
