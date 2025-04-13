import { defineConfig } from 'vitest/config';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		nodePolyfills({ 
			include: ['fs'], 
			overrides: { fs: 'memfs' } 
		}),
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
});
