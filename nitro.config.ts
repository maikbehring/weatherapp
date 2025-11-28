import { defineNitroConfig } from "nitropack/config";

export default defineNitroConfig({
  // Ensure @reduxjs/toolkit is bundled, not externalized
  externals: {
    inline: ["@reduxjs/toolkit"],
  },
  // Explicitly include node_modules that should be bundled
  nodeModules: ["@reduxjs/toolkit"],
});

