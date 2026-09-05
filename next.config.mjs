/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Permite fotos por URL vindas de qualquer domínio (fase MVP).
    // Antes de lançar a sério, considera restringir a domínios de confiança.
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

export default nextConfig;
