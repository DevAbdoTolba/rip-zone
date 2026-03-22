import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Prevent Mongoose from being bundled — causes issues with native deps
  serverExternalPackages: ['mongoose'],

  // Pre-wire SVGR for Phase 2 muscle map SVG imports
  // Allows: import MuscleMap from './muscle-map.svg' -> React component
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
}

export default nextConfig
