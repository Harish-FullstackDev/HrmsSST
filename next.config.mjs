/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // My Applications now lives on My Profile; older links (and emails) still
  // land there.
  async redirects() {
    return [{ source: "/my-applications", destination: "/my-profile", permanent: false }];
  },
  experimental: {
    agentUpgrade: "security",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
