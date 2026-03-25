// next.config.js
const nextConfig = {
  async headers() {
    return [{
      source: "/(.*)",
      headers: [{ key: "Content-Security-Policy", value: "frame-src 'self' https://player.vimeo.com;" }]
    }];
  }
};