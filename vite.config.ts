import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    // --- PROXY SETTINGS FIXED ---
    proxy: {
      '/api': {
        target: 'https://pf4cfv7swi2v26skkfxinvvtcq0xnjdx.lambda-url.ap-south-1.on.aws/',
        changeOrigin: true,
        // Do NOT include a rewrite rule here!
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));