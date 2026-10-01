/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // firebase-admin resolves parts of itself with dynamic requires, which Next's
  // server bundler cannot follow. Leaving it external keeps it loadable at
  // runtime instead of failing inside the bundle.
  serverExternalPackages: ["firebase-admin"],
  // The zips live outside public/ so they can only be fetched through the
  // authorised download route. Nothing imports them, so tracing has to be
  // told to ship them with that function.
  outputFileTracingIncludes: {
    "/api/download/[slug]": ["./private/downloads/**"],
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
