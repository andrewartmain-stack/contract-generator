import type { NextConfig } from 'next';

const nextConfig = {
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (isServer) {
      // Устанавливаем путь к Chromium для puppeteer
      config.externals.push({
        puppeteer: 'puppeteer',
      });
    }
    return config;
  },
  // Увеличиваем лимит размера тела запроса
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '10mb',
  },
};

export default nextConfig;
