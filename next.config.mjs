/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "picsum.photos"
      },
      {
        protocol: "https",
        hostname: "pixy.org"
      },
      {
        protocol: "https",
        hostname: "www.pixy.org"
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5001",
        pathname: "/static/**"
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5001",
        pathname: "/api/media/**"
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5001",
        pathname: "/uploads/**"
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5001",
        pathname: "/images/**"
      }
    ]
  },
  async rewrites() {
    const rewrites = [];
    rewrites.push({
      source: "/uploads/:path*",
      destination: "http://localhost:5001/uploads/:path*"
    });
    const proxyEnabled = process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_USE_REMOTE_API === "1";
    if (proxyEnabled) {
      rewrites.push({
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`
      });
    }
    return rewrites;
  }
};

export default nextConfig;
