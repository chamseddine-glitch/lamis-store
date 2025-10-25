
// FIX: Imported `loadEnv` and changed the config to a function to load and define environment variables.
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { URL, fileURLToPath } from 'url';

// https://vitejs.dev/config/
// FIX: The config is now a function to access `mode` and use `loadEnv`.
export default defineConfig(({ mode }) => {
    // FIX: Load env variables from .env files in the project root.
    // FIX: Replaced `process.cwd()` with `'.'` to resolve a TypeScript error where `cwd` was not found on `process`.
    const env = loadEnv(mode, '.', '');
    return {
        server: {
          port: 3000,
          host: '0.0.0.0',
        },
        plugins: [react()],
        // FIX: Added `define` block to make environment variables available on `process.env` in client-side code,
        // which resolves TypeScript errors with `import.meta.env` in `firebase.ts`.
        define: {
          'process.env.VITE_FIREBASE_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY),
          'process.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN),
          'process.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(env.VITE_FIREBASE_PROJECT_ID),
          'process.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET),
          'process.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID),
          'process.env.VITE_FIREBASE_APP_ID': JSON.stringify(env.VITE_FIREBASE_APP_ID),
        },
        resolve: {
          alias: {
            '@': fileURLToPath(new URL('.', import.meta.url)),
          }
        }
    };
});
