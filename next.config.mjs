/** @type {import('next').NextConfig} */
const nextConfig = {
    // 1. Abaikan Error TypeScript
    typescript: {
      ignoreBuildErrors: true,
    },
    // 2. Abaikan Error ESLint
    eslint: {
      ignoreDuringBuilds: true,
    },
  };
  
  export default nextConfig;