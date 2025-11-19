# Step-by-Step Guide: Deploy Legal Pages to Cloudflare Pages

This guide will walk you through deploying your Terms of Service and Privacy Policy pages to Cloudflare Pages and setting up the custom domain `volunteer-app.migokartel.xyz`.

## Prerequisites

- A Cloudflare account (free tier is sufficient)
- Access to your domain `migokartel.xyz` DNS settings (or ability to add DNS records)
- The `legal-pages/` directory ready in your project

---

## Part 1: Cloudflare Account Setup

### Step 1: Create or Log in to Cloudflare Account

1. Go to [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. Sign up for a free account (or log in if you already have one)
3. Complete the email verification if required

### Step 2: Add Your Domain to Cloudflare (If Not Already Added)

**Skip this step if `migokartel.xyz` is already in your Cloudflare account.**

1. In the Cloudflare dashboard, click **"Add a Site"**
2. Enter your domain: `migokartel.xyz`
3. Click **"Add site"**
4. Select the **Free** plan (or your preferred plan)
5. Cloudflare will scan your existing DNS records
6. Review the DNS records and click **"Continue"**
7. Update your domain's nameservers at your domain registrar:
   - Cloudflare will provide you with nameservers (e.g., `alice.ns.cloudflare.com` and `bob.ns.cloudflare.com`)
   - Go to your domain registrar (where you bought `migokartel.xyz`)
   - Replace the existing nameservers with Cloudflare's nameservers
   - Wait for DNS propagation (can take up to 24 hours, usually much faster)

---

## Part 2: Deploy Pages to Cloudflare Pages

### Step 3: Navigate to Cloudflare Pages

1. In the Cloudflare dashboard, click on **"Workers & Pages"** in the left sidebar
2. Click on **"Pages"** tab
3. Click **"Create a project"** button

### Step 4: Choose Deployment Method

You have three options. We'll use **Direct Upload** for the quickest deployment:

#### Option A: Direct Upload (Recommended for First Time)

1. Click **"Upload assets"** or **"Direct Upload"**
2. You'll need to prepare your files:
   ```bash
   # Navigate to your project directory
   cd /Users/logi/work/migo-kartel/volunteer-sunday-app
   
   # Create a zip file of the legal-pages directory
   cd legal-pages
   zip -r ../legal-pages.zip .
   cd ..
   ```
3. In Cloudflare Pages:
   - Click **"Upload assets"**
   - Drag and drop the `legal-pages.zip` file, OR
   - Click to browse and select the zip file
4. Enter a project name: `volunteer-app-legal` (or any name you prefer)
5. Click **"Deploy site"**
6. Wait for deployment to complete (usually takes 1-2 minutes)
7. Your site will be live at: `https://volunteer-app-legal.pages.dev` (or similar)

#### Option B: GitHub Integration (Recommended for Updates)

1. Push your `legal-pages` directory to a GitHub repository:
   ```bash
   # Create a new repository on GitHub first, then:
   cd /Users/logi/work/migo-kartel/volunteer-sunday-app
   
   # Create a new git repo for legal pages (optional, or use existing repo)
   # Or create a subdirectory in your existing repo
   ```
2. In Cloudflare Pages, click **"Connect to Git"**
3. Authorize Cloudflare to access your GitHub account
4. Select your repository
5. Configure build settings:
   - **Framework preset**: None
   - **Build command**: (leave empty)
   - **Build output directory**: `legal-pages`
   - **Root directory**: `/` (or the path to legal-pages if in a subdirectory)
6. Click **"Save and Deploy"**
7. Future updates: Just push to GitHub and Cloudflare will auto-deploy

#### Option C: Wrangler CLI (For Developers)

1. Install Wrangler:
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```
   This will open a browser window for authentication.

3. Deploy:
   ```bash
   cd /Users/logi/work/migo-kartel/volunteer-sunday-app/legal-pages
   wrangler pages deploy . --project-name=volunteer-app-legal
   ```

---

## Part 3: Set Up Custom Domain

### Step 5: Add Custom Domain in Cloudflare Pages

1. In your Cloudflare Pages project, click on the **"Custom domains"** tab
2. Click **"Set up a custom domain"**
3. Enter your custom domain: `volunteer-app.migokartel.xyz`
4. Click **"Continue"**

### Step 6: Configure DNS Records

Cloudflare will automatically create the necessary DNS records, but let's verify:

1. Go to your Cloudflare dashboard
2. Select your domain: `migokartel.xyz`
3. Click on **"DNS"** in the left sidebar
4. You should see a CNAME record automatically created:
   - **Type**: CNAME
   - **Name**: `volunteer-app`
   - **Target**: `volunteer-app-legal.pages.dev` (or your Pages URL)
   - **Proxy status**: Proxied (orange cloud) ✅

5. If the record doesn't exist, create it manually:
   - Click **"Add record"**
   - **Type**: CNAME
   - **Name**: `volunteer-app`
   - **Target**: `volunteer-app-legal.pages.dev` (use your actual Pages URL)
   - **Proxy status**: Proxied (orange cloud) ✅
   - Click **"Save"**

### Step 7: SSL Certificate Setup

1. Cloudflare automatically provisions SSL certificates for custom domains
2. Go to **SSL/TLS** in your Cloudflare dashboard
3. Ensure **SSL/TLS encryption mode** is set to **"Full"** or **"Full (strict)"**
4. Wait a few minutes for the SSL certificate to be issued
5. You can check the status in your Pages project under **"Custom domains"**

### Step 8: Verify Domain Setup

1. Wait 5-10 minutes for DNS propagation
2. Visit `https://volunteer-app.migokartel.xyz` in your browser
3. You should see your legal pages landing page
4. Test the links:
   - `https://volunteer-app.migokartel.xyz/terms.html`
   - `https://volunteer-app.migokartel.xyz/privacy.html`

---

## Part 4: Verify Deployment

### Step 9: Test All Pages

Visit and verify these URLs work:

1. **Main page**: `https://volunteer-app.migokartel.xyz`
2. **Terms of Service**: `https://volunteer-app.migokartel.xyz/terms.html`
3. **Privacy Policy**: `https://volunteer-app.migokartel.xyz/privacy.html`

### Step 10: Check Mobile Responsiveness

1. Open the pages on a mobile device or use browser dev tools
2. Verify the pages look good on mobile devices
3. Test all navigation links

---

## Part 5: Update Your App and Play Store

### Step 11: Add URLs to Your App

Update your app code to link to these pages:

```typescript
// Example: Add to your app's settings/about screen
const TERMS_URL = "https://volunteer-app.migokartel.xyz/terms.html";
const PRIVACY_URL = "https://volunteer-app.migokartel.xyz/privacy.html";
```

### Step 12: Update Play Store Listing

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app: **Mindnistry Volunteers**
3. Navigate to **App content** → **Privacy Policy**
4. Enter: `https://volunteer-app.migokartel.xyz/privacy.html`
5. If Terms of Service is required, add: `https://volunteer-app.migokartel.xyz/terms.html`
6. Save changes

---

## Troubleshooting

### Domain Not Resolving

**Problem**: `volunteer-app.migokartel.xyz` doesn't load

**Solutions**:
1. Check DNS records are correct (CNAME pointing to Pages URL)
2. Wait longer for DNS propagation (can take up to 24 hours)
3. Clear your browser cache
4. Try accessing from a different network/device
5. Check Cloudflare DNS dashboard for any errors

### SSL Certificate Issues

**Problem**: SSL certificate not working

**Solutions**:
1. Ensure SSL/TLS mode is set to "Full" or "Full (strict)"
2. Wait 10-15 minutes for certificate provisioning
3. Check SSL certificate status in Pages → Custom domains
4. Try accessing via HTTP first to verify DNS is working

### Pages Not Updating

**Problem**: Changes not showing after deployment

**Solutions**:
1. Clear Cloudflare cache: Dashboard → Caching → Purge Everything
2. Wait a few minutes for cache to clear
3. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
4. Check deployment status in Pages dashboard

### Build Errors (GitHub Integration)

**Problem**: Build fails when using GitHub integration

**Solutions**:
1. Verify build output directory is correct (`legal-pages`)
2. Check that all files are in the repository
3. Review build logs in Cloudflare Pages dashboard
4. Ensure no build command is needed (leave empty for static HTML)

---

## Quick Reference

### Your URLs After Deployment

- **Main**: `https://volunteer-app.migokartel.xyz`
- **Terms**: `https://volunteer-app.migokartel.xyz/terms.html`
- **Privacy**: `https://volunteer-app.migokartel.xyz/privacy.html`

### Cloudflare Dashboard Links

- **Pages**: [https://dash.cloudflare.com/pages](https://dash.cloudflare.com/pages)
- **DNS**: [https://dash.cloudflare.com/dns](https://dash.cloudflare.com/dns)
- **SSL/TLS**: [https://dash.cloudflare.com/ssl-tls](https://dash.cloudflare.com/ssl-tls)

### Useful Commands

```bash
# Deploy using Wrangler
cd legal-pages
wrangler pages deploy . --project-name=volunteer-app-legal

# Check DNS propagation
dig volunteer-app.migokartel.xyz

# Test SSL certificate
curl -I https://volunteer-app.migokartel.xyz
```

---

## Next Steps

1. ✅ Deploy pages to Cloudflare Pages
2. ✅ Set up custom domain
3. ✅ Verify all pages work
4. ✅ Add URLs to your app
5. ✅ Update Play Store listing
6. ✅ Test on mobile devices

---

## Support

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare Community](https://community.cloudflare.com/)
- [Cloudflare Support](https://support.cloudflare.com/)

---

**Note**: Keep your Cloudflare account credentials secure. The free tier is sufficient for hosting these pages with unlimited bandwidth and requests.

