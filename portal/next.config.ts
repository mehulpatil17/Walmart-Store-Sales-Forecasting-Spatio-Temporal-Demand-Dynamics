import type { NextConfig } from "next";

const repoName = "Walmart-Store-Sales-Forecasting-Spatio-Temporal-Demand-Dynamics";

const nextConfig: NextConfig = {
  output: "export",
  basePath: `/${repoName}`,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
