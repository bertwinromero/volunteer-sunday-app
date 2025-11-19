# Cloudflare Pages Deployment Guide

This guide explains how to deploy your Terms of Service and Privacy Policy pages to Cloudflare Pages.

## What You Need

1. **Cloudflare Account** (free tier is sufficient)
   - Sign up at [cloudflare.com](https://www.cloudflare.com)
   - Free account includes Cloudflare Pages hosting

2. **Cloudflare API Token** (for automated deployments)
   - Go to Cloudflare Dashboard → My Profile → API Tokens
   - Create a token with "Cloudflare Pages:Edit" permissions

3. **GitHub Account** (optional, for automated deployments)
   - If you want automatic deployments when you push changes

4. **Wrangler CLI** (optional, for command-line deployment)
   - Cloudflare's command-line tool
   - Can install with: `npm install -g wrangler`

## Deployment Options

### Option 1: Direct Upload (Simplest - No Code Required)

**Best for**: Quick one-time deployment, no automation needed

1. **Prepare HTML files**:
   - The `legal-pages/` directory contains ready-to-deploy HTML files
   - Or build them using the instructions below

2. **Deploy via Cloudflare Dashboard**:
   - Log in to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to **Workers & Pages** → **Pages**
   - Click **Create a project**
   - Select **Direct Upload**
   - Drag and drop the contents of the `legal-pages/` directory
   - Click **Deploy site**
   - Your site will be live at `your-project-name.pages.dev`

### Option 2: GitHub Integration (Recommended - Automated)

**Best for**: Automatic deployments when you update the files

1. **Create a GitHub Repository**:
   ```bash
   # Create a new repository on GitHub
   # Or use an existing one
   ```

2. **Push your legal-pages directory**:
   ```bash
   git init
   git add legal-pages/
   git commit -m "Add legal pages"
   git remote add origin https://github.com/yourusername/legal-pages.git
   git push -u origin main
   ```

3. **Connect to Cloudflare Pages**:
   - Go to Cloudflare Dashboard → **Workers & Pages** → **Pages**
   - Click **Create a project**
   - Select **Connect to Git**
   - Authorize Cloudflare to access your GitHub account
   - Select your repository
   - Configure build settings:
     - **Framework preset**: None
     - **Build command**: (leave empty)
     - **Build output directory**: `legal-pages`
     - **Root directory**: `/`
   - Click **Save and Deploy**

4. **Automatic Deployments**:
   - Every push to your main branch will automatically deploy
   - Cloudflare will build and deploy your site

### Option 3: Wrangler CLI (For Developers)

**Best for**: Command-line deployment, CI/CD integration

1. **Install Wrangler**:
   ```bash
   npm install -g wrangler
   ```

2. **Authenticate**:
   ```bash
   wrangler login
   ```

3. **Deploy**:
   ```bash
   cd legal-pages
   wrangler pages deploy . --project-name=your-project-name
   ```

## Custom Domain Setup

1. **Add Custom Domain in Cloudflare**:
   - Go to your Cloudflare Pages project
   - Click **Custom domains** tab
   - Click **Set up a custom domain**
   - Enter your domain (e.g., `legal.yourdomain.com`)

2. **DNS Configuration**:
   - Cloudflare will provide DNS records to add
   - Add a CNAME record pointing to your Pages site
   - Or use Cloudflare's automatic DNS setup if your domain is on Cloudflare

3. **SSL Certificate**:
   - Cloudflare automatically provisions SSL certificates
   - HTTPS will be enabled automatically

## Updating Your Pages

### If Using Direct Upload:
- Re-upload the updated files through the dashboard

### If Using GitHub:
- Make changes to your files
- Commit and push to GitHub
- Cloudflare will automatically rebuild and deploy

### If Using Wrangler:
```bash
cd legal-pages
wrangler pages deploy . --project-name=your-project-name
```

## File Structure

```
legal-pages/
├── index.html          # Landing page with links to terms and privacy
├── terms.html          # Terms of Service page
├── privacy.html        # Privacy Policy page
├── styles.css          # Styling for all pages
└── README.md           # This file
```

## URLs After Deployment

After deployment, your pages will be available at:
- **Main site**: `https://your-project-name.pages.dev`
- **Terms**: `https://your-project-name.pages.dev/terms.html`
- **Privacy**: `https://your-project-name.pages.dev/privacy.html`

Or with a custom domain:
- **Main site**: `https://legal.yourdomain.com`
- **Terms**: `https://legal.yourdomain.com/terms.html`
- **Privacy**: `https://legal.yourdomain.com/privacy.html`

## Adding to Your App

Once deployed, you can link to these pages from your app:

1. **In your app's settings/about screen**, add links:
   - Terms of Service: `https://your-project-name.pages.dev/terms.html`
   - Privacy Policy: `https://your-project-name.pages.dev/privacy.html`

2. **For Play Store submission**, provide these URLs in:
   - Google Play Console → App content → Privacy Policy URL
   - Google Play Console → App content → Terms of Service URL (if required)

## Troubleshooting

### Build Fails
- Check that your HTML files are valid
- Ensure the build output directory is correct
- Check Cloudflare Pages build logs for errors

### Custom Domain Not Working
- Verify DNS records are correct
- Wait for DNS propagation (can take up to 24 hours)
- Check SSL certificate status in Cloudflare dashboard

### Files Not Updating
- Clear Cloudflare cache: Dashboard → Caching → Purge Everything
- Check that you're deploying the correct directory
- Verify file paths are correct

## Cost

Cloudflare Pages is **free** for:
- Unlimited sites
- Unlimited requests
- 500 builds per month
- Custom domains included
- SSL certificates included

## Next Steps

1. Deploy using one of the methods above
2. Test your pages are accessible
3. Set up a custom domain (optional)
4. Add the URLs to your app and Play Store listing
5. Update the placeholder information in the HTML files with your actual details

## Support

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare Community](https://community.cloudflare.com/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)

