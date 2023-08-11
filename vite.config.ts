// vite.config.ts
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from "path";
import terser from "@rollup/plugin-terser";

// https://vitejs.dev/guide/build.html#library-mode
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'data-viz',
      fileName: 'data-viz',
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        // enable variable renaming
        keep_fnames: false,
        keep_infinity: true,
        // set the maximum line length to prevent extremely long lines
      },
      mangle: {
        properties: false,
        toplevel: true,
      },
    },
    sourcemap: true,
  },
  plugins: [
    dts(),
    terser(),
  ],
  css: {
    modules: {
      scopeBehaviour: 'global'
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    },
  },
});