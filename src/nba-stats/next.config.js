/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Set up logging to confirm config is being loaded
  webpack: (config, { isServer }) => {
    console.log('Next.js config is being loaded!');
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Is Server: ${isServer}`);
    return config;
  },
  
  // Use a more specific rewrite configuration
  async rewrites() {
    console.log('Configuring rewrites for API proxy');
    
    const rewrites = [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      }
    ];
    
    console.log('Rewrites configuration:', JSON.stringify(rewrites, null, 2));
    return rewrites;
  },
};

console.log('next.config.js was processed');

module.exports = nextConfig;
