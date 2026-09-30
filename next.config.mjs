/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The zips live outside public/ so they can only be fetched through the
  // authorised download route. Nothing imports them, so tracing has to be
  // told to ship them with that function.
  outputFileTracingIncludes: {
    "/api/download/[slug]": ["./private/downloads/**"],
    // The customised download is built from the template sources, and each
    // product page shows that template's README.
    "/api/editor/[slug]/download": ["./templates/*/*.{html,md,txt}", "./templates/*/assets/**"],
    "/t/[slug]": ["./templates/*/README.md"],
  },
  async headers() {
    return [
      {
        // Live template demos must not compete with the store in search
        // results, or read as duplicate content.
        source: "/preview/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
