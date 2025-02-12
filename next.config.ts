import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    ppr: 'incremental'//this allows you to adopt PPR for specific routes
  }
};

export default nextConfig;
