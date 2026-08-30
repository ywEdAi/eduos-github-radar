const radarBasePath = "/directory";

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: radarBasePath,
  async redirects() {
    return [
      {
        source: "/",
        destination: radarBasePath,
        permanent: false,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
