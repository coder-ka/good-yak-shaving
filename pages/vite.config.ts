import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";

import path, { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  base: "",
  build: {
    outDir: path.resolve(__dirname, "../dist/pages"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        options: resolve(__dirname, "options.html"),
        popup: resolve(__dirname, "popup.html"),
        view: resolve(__dirname, "view.html"),
      },
    },
  },
  server: {
    port: 3001,
  },
});
