import { defineConfig, type Options } from 'tsup';

const baseOptions: Options = {
  clean: true,
  dts: true,
  entry: ["src/index.?s"],
  minify: false,
  skipNodeModulesBundle: true,
  sourcemap: true,
  target: "es2017",
  tsconfig: "./tsconfig.json",
  keepNames: true,
  cjsInterop: true,
  splitting: true,
};

export default [
  defineConfig({
    ...baseOptions,
    outDir: "dist/cjs",
    format: "cjs",
    outExtension: () => ({ js: ".cjs" }),
  }),
  defineConfig({
    ...baseOptions,
    outDir: "dist/esm",
    format: "esm",
  }),
  defineConfig({
    ...baseOptions,
    entry: ["scripts/wael.ts"],
    skipNodeModulesBundle: false,
    splitting: false,
    outDir: "dist/wael",
    format: "cjs",
    outExtension: () => ({ js: ".cjs" }),
  }),
];