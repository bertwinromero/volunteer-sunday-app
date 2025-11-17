# Legal Pages for Mindnistry Volunteers

This directory contains the HTML files for the Terms of Service and Privacy Policy pages that can be deployed to Cloudflare Pages.

## Files

- `index.html` - Landing page with links to terms and privacy policy
- `terms.html` - Terms of Service page
- `privacy.html` - Privacy Policy page
- `styles.css` - Styling for all pages

## Before Deploying

1. **Review Content**: 
   - All placeholder information has been updated with actual details
   - Last Updated: November 16, 2025
   - Contact Email: niel@migokartel.xyz
   - Website: https://volunteer-app.migokartel.xyz
   - Jurisdiction: Philippines
   - Address: JIA CDO, Cinema 1, Lim Ket Kai Mall, Cagayan de Oro City, Misamis Oriental 9000
   - Have a legal professional review the documents before deploying
   - Ensure all information is accurate and up-to-date

## Deployment

See `../CLOUDFLARE_DEPLOYMENT.md` for detailed deployment instructions.

## Quick Deploy

### Option 1: Direct Upload
1. Zip the contents of this directory
2. Go to Cloudflare Dashboard → Pages → Create project → Direct Upload
3. Upload the zip file

### Option 2: GitHub
1. Push this directory to a GitHub repository
2. Connect the repository to Cloudflare Pages
3. Set build output directory to `legal-pages`

### Option 3: Wrangler CLI
```bash
npm install -g wrangler
wrangler login
wrangler pages deploy . --project-name=your-project-name
```

## URLs After Deployment

- Main: `https://your-project-name.pages.dev`
- Terms: `https://your-project-name.pages.dev/terms.html`
- Privacy: `https://your-project-name.pages.dev/privacy.html`

