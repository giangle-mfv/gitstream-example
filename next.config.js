const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: !!process.env.ANALYZE,
})

const env = {
  ENVIRONMENT: process.env.ENVIRONMENT || '',
  APP_BE: process.env.APP_BE,
  APP_FE: process.env.APP_FE,
  APP_MFID_BASE: process.env.APP_MFID_BASE,
  APP_NAVIS_BASE: process.env.APP_NAVIS_BASE,
  APP_HR_MASTER_BASE: process.env.APP_HR_MASTER_BASE,
  APP_INQUIRY_LINK: process.env.APP_INQUIRY_LINK,
  ROLLBAR_CLIENT_ACCESS_KEY: process.env.ROLLBAR_CLIENT_ACCESS_KEY,
  ROLLBAR_SERVER_ACCESS_KEY: process.env.ROLLBAR_SERVER_ACCESS_KEY,
  ROLLBAR_CODE_VERSION: process.env.ROLLBAR_CODE_VERSION,
  MINIMUM_RESERVED_TIME: process.env.MINIMUM_RESERVED_TIME,
  GTM_ID: process.env.GTM_ID,
  APPCUES_ID: process.env.APPCUES_ID,
  BUILD_NUMBER: process.env.BUILD_NUMBER,
}

/** @type {import('next').NextConfig['webpack']} */
const webpack = (config, _options) => {
  config.module.rules.push({
    test: /\.html$/i,
    use: 'raw-loader',
  })

  config.module.rules.push({
    test: /\.svg$/,
    issuer: /\.[jt]sx?$/,
    use: [
      {
        loader: '@svgr/webpack',
        options: {
          removeViewBox: false,
        },
      },
    ],
    exclude: /(\/fonts)/,
  })

  config.module.rules.push({
    test: /src\/(components|helpers|hocs|hooks|security)\/index.tsx/i,
    sideEffects: false,
  })

  return config
}

/** @type {import('next').NextConfig} */
const settings = {
  reactStrictMode: false,
  compiler: {
    styledComponents: true,
    reactRemoveProperties: ['production'].includes(env.ENVIRONMENT),
  },
  swcMinify: false,
  assetPrefix: ['production', 'staging', 'beta', 'alpha'].includes(env.ENVIRONMENT)
    ? `${env.APP_FE}/${env.ENVIRONMENT}`
    : '',
  productionBrowserSourceMaps: true, // enable production browser sourcemaps for uploading to Rollbar and will be removed after that
  env,
  webpack,
  typescript: {
    tsconfigPath: './tsconfig.build.json',
  },
  async rewrites() {
    return env.APP_BE === env.APP_FE
      ? []
      : [
          {
            source: '/api/:path*',
            destination: `${env.APP_BE}/api/:path*`, // Proxy to Backend
          },
        ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'none'",
          },
        ],
      },
    ]
  },
}

module.exports = withBundleAnalyzer(settings)
