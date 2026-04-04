/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "@libsql/client",
    "libsql",
    "@prisma/adapter-libsql",
    "@libsql/isomorphic-fetch",
    "@libsql/isomorphic-ws",
  ],
};

module.exports = nextConfig;
