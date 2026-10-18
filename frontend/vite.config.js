import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // The dev server forwards /api to the backend, so the browser sees one origin (no CORS needed)
    server: {
      proxy: { '/api': env.API_URL || 'http://localhost:4000' },
    },
  };
});
