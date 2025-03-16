require('esbuild').buildSync({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node16',
  outfile: 'dist/server.js',
});
