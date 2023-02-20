import { defineConfig } from "vite";
import liveReload from 'vite-plugin-live-reload';

export default defineConfig({
  css: {
    devSourcemap: true
  },
  build: {
    outDir: "./dist",
    target: "esnext",
    polyfillDynamicImport: false
  },
  plugins: [
    liveReload('./html/**/*.html', { alwaysReload: true })
  ]
});