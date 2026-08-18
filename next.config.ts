import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Libera o domínio que o GitHub Codespaces usa para expor a porta 3000.
      // Sem isso, o Next.js bloqueia os formulários (server actions) porque o
      // endereço público (*.app.github.dev) é diferente do "localhost" interno.
      allowedOrigins: ["*.app.github.dev", "localhost:3000"],
    },
  },
};

export default nextConfig;