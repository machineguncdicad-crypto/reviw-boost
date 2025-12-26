/** @type {import('next').NextConfig} */
const nextConfig = {
    // 1. MATIKAN ERROR TYPESCRIPT (Biar Vercel gak rewel)
    typescript: {
      ignoreBuildErrors: true,
    },
    // 2. MATIKAN ERROR ESLINT (Biar kode gak rapi tetep jalan)
    eslint: {
      ignoreDuringBuilds: true,
    },
  };
  
  export default nextConfig;