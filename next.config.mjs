/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config) => {
        config.cache = {
            type: 'memory',
        };
        config.resolve.fallback = {
            fs: false,
            os: false,
            path: false,
            crypto: false,
        };
        return config;
    },
};

export default nextConfig;
