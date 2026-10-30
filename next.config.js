/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@faker-js/faker", "node-pg-migrate", "uuid"],
  outputFileTracingIncludes: {
    "/api/v1/migrations": ["./infra/migrations/**/*"],
  },
};

module.exports = nextConfig;
