# Cloudflare Deployment Quick Start Checklist

## ✅ Pre-Deployment Checklist

- [x] Terms and Privacy Policy content created
- [x] All placeholder information updated
- [x] HTML files generated and styled
- [x] Changes committed to git

## 🚀 Deployment Steps (15-30 minutes)

### 1. Cloudflare Account Setup (5 min)
- [ ] Sign up/Login at [dash.cloudflare.com](https://dash.cloudflare.com)
- [ ] Add domain `migokartel.xyz` to Cloudflare (if not already added)
- [ ] Update nameservers at domain registrar (if needed)

### 2. Deploy Pages (5-10 min)

**Option A: Direct Upload (Easiest)**
- [ ] Go to Workers & Pages → Pages → Create project
- [ ] Choose "Upload assets" / "Direct Upload"
- [ ] Create zip: `cd legal-pages && zip -r ../legal-pages.zip .`
- [ ] Upload zip file
- [ ] Project name: `volunteer-app-legal`
- [ ] Click "Deploy site"
- [ ] Note your Pages URL: `https://volunteer-app-legal.pages.dev`

**Option B: GitHub Integration**
- [ ] Push `legal-pages/` to GitHub
- [ ] Connect GitHub repo to Cloudflare Pages
- [ ] Build output directory: `legal-pages`
- [ ] Deploy

**Option C: Wrangler CLI**
```bash
npm install -g wrangler
wrangler login
cd legal-pages
wrangler pages deploy . --project-name=volunteer-app-legal
```

### 3. Custom Domain Setup (5-10 min)
- [ ] In Pages project → Custom domains → Set up custom domain
- [ ] Enter: `volunteer-app.migokartel.xyz`
- [ ] Verify CNAME record created in DNS:
  - Name: `volunteer-app`
  - Target: `volunteer-app-legal.pages.dev`
  - Proxy: Enabled (orange cloud)
- [ ] Wait 5-10 minutes for DNS/SSL

### 4. Verification (5 min)
- [ ] Visit: `https://volunteer-app.migokartel.xyz`
- [ ] Test: `https://volunteer-app.migokartel.xyz/terms.html`
- [ ] Test: `https://volunteer-app.migokartel.xyz/privacy.html`
- [ ] Check mobile responsiveness

### 5. Update App & Play Store (5 min)
- [ ] Add URLs to your app code
- [ ] Update Play Store Privacy Policy URL
- [ ] Update Play Store Terms URL (if required)

## 📋 Your URLs

After deployment, use these URLs:

- **Main**: `https://volunteer-app.migokartel.xyz`
- **Terms**: `https://volunteer-app.migokartel.xyz/terms.html`
- **Privacy**: `https://volunteer-app.migokartel.xyz/privacy.html`

## 🔧 Troubleshooting

**Domain not working?**
- Check DNS records in Cloudflare dashboard
- Wait longer for propagation (up to 24 hours)
- Clear browser cache

**SSL issues?**
- Set SSL/TLS mode to "Full" in Cloudflare
- Wait 10-15 minutes for certificate

**Pages not updating?**
- Purge Cloudflare cache
- Hard refresh browser (Cmd+Shift+R)

## 📚 Full Guide

See `DEPLOY_TO_CLOUDFLARE.md` for detailed step-by-step instructions.

