/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  eslint: {
    dirs: ['src'],
  },
  webpack: (config) => {
    config.externals.push('node-fetch');
    return config;
  },
};

export default nextConfig;
