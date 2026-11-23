import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// The API gateway (Spring Cloud Gateway) has no CORS configuration, so in
// development the browser talks to Vite on the same origin and Vite forwards
// every /api/* call to the gateway. No backend change required.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const gateway = env.VITE_DEV_PROXY_TARGET || 'http://localhost:8080';
  const proxy = { '/api': { target: gateway, changeOrigin: true } };

  return {
    plugins: [react()],
    // strictPort: Keycloak's redirect URI is http://localhost:5173, so Vite
    // must not silently fall back to another port.
    server: { port: 5173, strictPort: true, proxy },
    preview: { port: 5173, strictPort: true, proxy },
  };
});
