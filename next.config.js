/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
      topLevelAwait: true,
    };

    // Handle WASM files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    // Fallback for Node.js modules in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        path: false,
        buffer: false,
      };
    }

    // Ignore specific warnings for WASM modules
    config.ignoreWarnings = [
      { module: /sidan_csl_rs_bg\.wasm/ },
      { message: /async\/await/ },
    ];

    return config;
  },
  // Remove the experimental esmExternals that's causing issues
  transpilePackages: ['@meshsdk/core', '@meshsdk/core-csl', '@sidan-lab/sidan-csl-rs-browser'],
};

module.exports = nextConfig;
