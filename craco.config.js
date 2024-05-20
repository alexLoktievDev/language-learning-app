const path = require('path');

module.exports = {
  webpack: {
    setupTestFrameworkScriptFile: './jest.config.js',
    alias: {
      '@components': path.join(path.resolve(__dirname, 'src/components')),
      '@components/*': path.join(path.resolve(__dirname, 'src/components/*')),
      '@helpers': path.join(path.resolve(__dirname, 'src/helpers')),
      '@helpers/*': path.join(path.resolve(__dirname, 'src/helpers/*')),
      '@store': path.join(path.resolve(__dirname, 'src/store')),
      '@store/*': path.join(path.resolve(__dirname, 'src/store/*')),
      '@types': path.join(path.resolve(__dirname, 'src/types')),
      '@assets': path.join(path.resolve(__dirname, 'src/assets')),
      '@services': path.join(path.resolve(__dirname, 'src/services')),
      '@services/*': path.join(path.resolve(__dirname, 'src/services/*')),
      '@assets/*': path.join(path.resolve(__dirname, 'src/assets/*')),
      '@styles': path.join(path.resolve(__dirname, 'src/styles')),
    },
    module: {
      rules: [
        {
          test: /\.svg$/i,
          issuer: /\.[jt]sx?$/,
          use: ['@svgr/webpack'],
        },
      ],
    },
  },
};
