export default {
  // Ensure @reduxjs/toolkit is bundled, not externalized
  // By default, Nitro externalizes node_modules, but we need @reduxjs/toolkit bundled
  // because it's required by mittwald remote components during SSR
  experimental: {
    wasm: true,
  },
  // Explicitly include node_modules that should be bundled
  nodeModules: ["@reduxjs/toolkit"],
  // Don't externalize @reduxjs/toolkit
  externals: {
    // Exclude @reduxjs/toolkit from being externalized
  },
};

