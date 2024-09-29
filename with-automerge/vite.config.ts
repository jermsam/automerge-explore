// vite.config.ts
import {defineConfig} from 'vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import {nodePolyfills} from 'vite-plugin-node-polyfills';


export default defineConfig({
  plugins: [wasm(), topLevelAwait(), nodePolyfills({
    protocolImports: true, // Optional: If you're using Node's `path` or `url` modules
  })],
});
