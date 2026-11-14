const nextConfig = {
  async redirects() {
    return [
      { source: "/nyheter", destination: "/artikler", permanent: true },
      { source: "/nyheter/:slug", destination: "/artikler/:slug", permanent: true },
    ];
  },
};

module.exports = nextConfig;
