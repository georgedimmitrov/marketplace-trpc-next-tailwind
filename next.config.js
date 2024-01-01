/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "localhost",
        pathname: "**",
        port: "3000",
        protocol: "http",
      },
    ],
  },
};

// if deploying to production for the images to show migth have to do smth like this
// const nextConfig = {
//   images: {
//     domains: [
//       "localhost",
//       "yourdomain.url",
//     ],
//   },
// }

module.exports = nextConfig;
