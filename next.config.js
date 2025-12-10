/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize pdfjs-dist on server side to avoid bundling issues
      // This prevents webpack from trying to bundle the ESM module
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('pdfjs-dist');
        config.externals.push('pdfjs-dist/legacy/build/pdf.mjs');
        config.externals.push(/^pdfjs-dist/);
      } else {
        // If externals is an object, convert to array
        const externalsArray = [config.externals];
        externalsArray.push('pdfjs-dist');
        externalsArray.push('pdfjs-dist/legacy/build/pdf.mjs');
        externalsArray.push(/^pdfjs-dist/);
        config.externals = externalsArray;
      }
      
      // Don't parse pdfjs-dist files
      config.module = config.module || {};
      config.module.noParse = config.module.noParse || [];
      if (Array.isArray(config.module.noParse)) {
        config.module.noParse.push(/pdfjs-dist/);
      }
    }
    return config;
  },
};

module.exports = nextConfig;

