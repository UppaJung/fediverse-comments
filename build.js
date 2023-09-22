import { build } from 'esbuild';

await build({
  entryPoints: ['src/index.ts'],
  outfile: "lib/fediverse-comments.js",
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ['chrome58', 'firefox57', 'safari11', 'edge18'],
});

await build({
  entryPoints: ['src/index.ts'],
  outfile: "lib/fediverse-comments-debug.js",
  bundle: true,
  minify: false,
  sourcemap: true,
  target: ['chrome58', 'firefox57', 'safari11', 'edge18'],
});