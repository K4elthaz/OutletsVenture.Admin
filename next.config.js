/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js image optimization config
  images: {
    remotePatterns: [
      {
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        hostname: 'via.placeholder.com',
      }
    ],
  },
};

module.exports = nextConfig;
