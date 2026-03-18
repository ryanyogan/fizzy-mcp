import { defineConfig } from 'vite-plus';

// Bundle workspace packages so they don't need to be published separately
const noExternal = ['@fizzy-mcp/shared', '@fizzy-mcp/client', '@fizzy-mcp/tools'];

export default defineConfig({
  pack: [
    {
      entry: ['src/index.ts'],
      format: ['esm'],
      dts: true,
      sourcemap: true,
      target: 'es2022',
      clean: true,
      fixedExtension: false,
      deps: {
        alwaysBundle: noExternal,
      },
    },
    {
      entry: ['src/cli.ts'],
      format: ['esm'],
      dts: true,
      sourcemap: true,
      target: 'es2022',
      fixedExtension: false,
      banner: {
        js: '#!/usr/bin/env node',
      },
      deps: {
        alwaysBundle: noExternal,
      },
    },
  ],
});
