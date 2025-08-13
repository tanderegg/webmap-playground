/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: 'http://api:5000/:path*'
      }
    ]
  }
};

module.exports = nextConfig;