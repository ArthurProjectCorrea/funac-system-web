import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Adicione aqui: images, redirects, headers, etc.
  experimental: {
    authInterrupts: true,
  },
};

export default nextConfig;
