import { defineConfig } from 'vite'
import { resolve } from 'path'

// Demo-only vite config. Kept separate from any library build config so the
// published artifact is unaffected by how the demo page is bundled.
export default defineConfig({
  root: 'demo',
  base: './',

  resolve: {
    // The demo imports the package by name but resolves to working-tree source,
    // so the page shows the behaviour of the code in this repo, not of the last
    // published tarball.
    alias: {
      '@dank-inc/data-buddy': resolve(__dirname, 'src/lib/index.ts'),
    },
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
  },
})
