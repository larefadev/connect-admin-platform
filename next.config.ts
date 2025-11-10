import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = [
  {
    protocol: 'https',
    hostname: 'cdn.shopify.com',
    port: '',
    pathname: '/**',
  },
  {
    protocol: 'https',
    hostname: 'refaccionesdotcom.s3.us-east-2.amazonaws.com',
    port: '',
    pathname: '/**',
  },
];

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const supabaseHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
    remotePatterns.push({
      protocol: 'https',
      hostname: supabaseHost,
      port: '',
      pathname: '/**',
    });
  } catch (error) {
    console.warn('No se pudo analizar NEXT_PUBLIC_SUPABASE_URL para configurar imágenes remotas.', error);
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
