import { defineConfig } from 'tsup';
import fs from 'fs';
import path from 'path';

export default defineConfig({
    entry: ['src/node.index.ts', 'src/web.index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: false,
    clean: true,
});
