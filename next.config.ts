import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Prevent Mongoose from being bundled — causes issues with native deps
  serverExternalPackages: ['mongoose'],

  // Pre-wire SVGR for Phase 2 muscle map SVG imports
  // Allows: import MuscleMap from './muscle-map.svg' -> React component
  // svgoConfig disables cleanupIds — muscle map hit-layer paths use IDs for event delegation
  turbopack: {
    rules: {
      '*.svg': {
        loaders: [
          {
            loader: '@svgr/webpack',
            options: {
              svgoConfig: {
                plugins: [
                  {
                    name: 'preset-default',
                    params: {
                      overrides: {
                        cleanupIds: false,
                        removeHiddenElems: false,
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
        as: '*.js',
      },
    },
  },
}

export default nextConfig
