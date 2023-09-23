import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteTsconfigPaths(),
    nodePolyfills({
      include: ["util", "buffer"],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  server: {
    open: true,
    // https: true
  },
});
