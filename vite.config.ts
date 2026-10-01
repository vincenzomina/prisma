// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

import { fileURLToPath } from "node:url";

// @solana/kit-plugin-rpc and -wallet only export "browser"/"node" conditions, which the
// worker server build can't resolve. Point both at their browser builds (the code only
// runs in the browser; the client is created lazily).
const solanaBrowser = (pkg: string) =>
  fileURLToPath(new URL(`./node_modules/@solana/${pkg}/dist/index.browser.mjs`, import.meta.url));

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      {
        name: "solana-browser-builds",
        enforce: "pre",
        resolveId(id: string) {
          const m = /^@solana\/(kit-plugin-rpc|kit-plugin-wallet)$/.exec(id);
          return m ? solanaBrowser(m[1]) : null;
        },
      },
    ],
  },
});
