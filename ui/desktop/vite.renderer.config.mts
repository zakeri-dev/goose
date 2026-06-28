import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

// https://vitejs.dev/config
export default defineConfig({
  define: {
    'process.env.GOOSE_TUNNEL': JSON.stringify(process.env.GOOSE_TUNNEL !== 'no' && process.env.GOOSE_TUNNEL !== 'none'),
  },

  plugins: [tailwindcss()],

  // SOHA: pnpm hoists react to ui/node_modules; without forcing a single
  // canonical copy the production bundle gets two React instances
  // ("Cannot read properties of null (reading 'useRef')" → white screen).
  // Upstream removed this in #9842 because their alias pointed elsewhere; our
  // desktop/node_modules/react junction makes this path correct for our layout.
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      react: resolve(__dirname, 'node_modules/react'),
      'react-dom': resolve(__dirname, 'node_modules/react-dom'),
    },
  },

  // Vite caches a copy of @aaif/goose-sdk and doesn't notice when we rebuild it
  // locally, so it serves stale code until you clear node_modules/.vite by hand.
  // Excluding it makes Vite always read the latest ui/sdk/dist build.
  // Dev-server only — release builds ignore optimizeDeps.
  optimizeDeps: {
    exclude: ['@aaif/goose-sdk'],
  },

  build: {
    target: 'esnext'
  },
});
