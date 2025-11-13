/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignorar módulos nativos que pdfjs-dist intenta cargar pero no necesitamos
      config.resolve.alias.canvas = false
      config.resolve.alias.encoding = false
    }
    return config
  },
}

export default nextConfig
