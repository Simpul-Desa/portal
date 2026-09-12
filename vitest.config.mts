import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    env: {
      NEXT_PUBLIC_API_URL: "http://localhost:8000",
      NEXT_PUBLIC_PORTAL_URL: "http://localhost:3000",
      NEXT_PUBLIC_DOCS_URL: "http://localhost:3001",
      NEXT_PUBLIC_SUPABASE_URL: "https://mriaaaptioatrysztutq.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_rRmIvCRpQFHEmJIH6Eo9lQ_VU28VPwf",
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
