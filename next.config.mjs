/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The zips live outside public/ so they can only be fetched through the
  // authorised download route. Nothing imports them, so tracing has to be
  // told to ship them with that function.
  outputFileTracingIncludes: {
    "/api/download/[slug]": ["./private/downloads/**"],
  },
};

export default nextConfig;
