/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Izin ambil gambar dari website mana aja
      },
    ],
  },
};

export default nextConfig;