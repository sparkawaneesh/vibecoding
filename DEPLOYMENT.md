# Vibe Studio Deployment Guide

This guide outlines the steps to deploy Vibe Studio, a creative workspace that combines a powerful code editor and a versatile design tool.

## Prerequisites

Before deploying, ensure you have the following:

1. Node.js (v18 or later)
2. npm or yarn
3. A Clerk account for authentication
4. A Liveblocks account for real-time collaboration
5. A hosting platform (Vercel, Netlify, or your own server)

## Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```
# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Liveblocks (for collaborative features)
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=your_liveblocks_public_key
LIVEBLOCKS_SECRET_KEY=your_liveblocks_secret_key
```

Replace the placeholder values with your actual API keys.

## Local Deployment

To run the application locally:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. Start the production server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`.

## Deployment to Vercel

Vercel is the recommended platform for deploying Next.js applications:

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy the application:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

## Deployment to Netlify

To deploy to Netlify:

1. Install the Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Deploy the application:
   ```bash
   netlify deploy
   ```

4. For production deployment:
   ```bash
   netlify deploy --prod
   ```

## Custom Server Deployment

To deploy to your own server:

1. Build the application:
   ```bash
   npm run build
   ```

2. Transfer the following files/directories to your server:
   - `.next/`
   - `public/`
   - `package.json`
   - `next.config.mjs`
   - `.env.local` (with production values)

3. On your server, install production dependencies:
   ```bash
   npm install --production
   ```

4. Start the application:
   ```bash
   npm start
   ```

## Setting Up Continuous Deployment

For continuous deployment, connect your Git repository to your hosting platform:

1. **Vercel**: Connect your GitHub, GitLab, or Bitbucket repository in the Vercel dashboard.
2. **Netlify**: Connect your repository in the Netlify dashboard.

Configure the build settings:
- Build command: `npm run build`
- Output directory: `.next`
- Environment variables: Add your Clerk and Liveblocks keys

## Post-Deployment Tasks

After deployment, perform these tasks:

1. Configure your custom domain if needed
2. Set up SSL certificates
3. Test the application thoroughly
4. Monitor performance and errors

## Troubleshooting

Common issues and solutions:

- **API Key Issues**: Ensure your environment variables are correctly set
- **Build Failures**: Check for missing dependencies or compatibility issues
- **Performance Issues**: Consider implementing caching strategies

## Maintenance

Regular maintenance tasks:

1. Keep dependencies updated
2. Monitor application performance
3. Regularly backup your data
4. Check for security vulnerabilities

## Support

If you encounter any issues during deployment, refer to:

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Clerk Documentation](https://clerk.dev/docs)
- [Liveblocks Documentation](https://liveblocks.io/docs) 