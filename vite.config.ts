import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { readFileSync } from 'fs';
import { sveltekit } from '@sveltejs/kit/vite';

const file = fileURLToPath(new URL('package.json', import.meta.url));
const json = readFileSync(file, 'utf8');
const pkg = JSON.parse(json);

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
	define: {
        PKG: pkg
    }
});
