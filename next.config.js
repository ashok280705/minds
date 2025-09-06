/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async rewrites() {
    return [
      {
        source: '/api/python-backend/:path*',
        destination: `${process.env.PYTHON_BACKEND_URL}/:path*`,
      },
      {
        source: '/api/risk-analyzer/:path*',
        destination: `${process.env.RISK_ANALYZER_URL}/:path*`,
      },
      {
        source: '/api/prescription-reader/:path*',
        destination: `${process.env.PRESCRIPTION_READER_URL}/:path*`,
      },
    ];
  },
}

module.exports = nextConfig