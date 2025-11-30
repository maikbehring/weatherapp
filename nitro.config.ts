// Nitro configuration
// Supports both Netlify and Render.com deployments
// For Render.com: NITRO_PRESET=node-server pnpm build
// For Netlify: uses default 'netlify' preset

const preset = process.env.NITRO_PRESET || 'netlify';

export default {
  preset,
  prerender: {
    routes: ['/'],
  },
  // Set CSP headers for mStudio embedding (works for both Netlify and Render)
  routeRules: {
    '/**': {
      headers: {
        'Content-Security-Policy': 'frame-ancestors https://studio.mittwald.de https://*.mittwald.de',
        'X-Frame-Options': 'allow-from https://studio.mittwald.de',
      },
    },
  },
};

