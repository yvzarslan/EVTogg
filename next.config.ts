/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'ev-database.org' },
      { protocol: 'https', hostname: '**' }, // Tüm güvenli kaynaklara izin ver
      { protocol: 'http', hostname: '**' },
    ],
  },
};

export default nextConfig;