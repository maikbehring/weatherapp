export default {
  // Ensure @reduxjs/toolkit is bundled, not externalized
  // Remove it from externals so it gets bundled
  externals: {
    exclude: ["@reduxjs/toolkit"],
  },
  // Explicitly include node_modules that should be bundled
  nodeModules: ["@reduxjs/toolkit"],
};

