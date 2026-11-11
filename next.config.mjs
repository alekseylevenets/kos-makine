/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/", destination: "/tr", permanent: false },
      { source: "/katalog", destination: "/tr/makineler", permanent: true },
    ];
  },
};
export default nextConfig;
