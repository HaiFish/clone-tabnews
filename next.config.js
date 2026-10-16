/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["node-pg-migrate"],
  outputFileTracingIncludes: {
    "/api/v1/migrations": ["./infra/migrations/**/*"],
  },
};

module.exports = nextConfig;
