/** @type {import('next').NextConfig} */
const nextConfig = {
  // Same as production.
  skipTrailingSlashRedirect: true,
  // Same as production: expose the deploy ID, so each response shows which deploy served it.
  env: {
    DEPLOY_ID: process.env.DEPLOY_ID,
  },
}

export default nextConfig
