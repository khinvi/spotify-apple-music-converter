# Deployment Guide

This guide covers deploying the Spotify to Apple Music Converter to GitHub Pages.

## Prerequisites

- GitHub account
- Git installed locally
- Node.js and npm installed
- API credentials configured (see [API_SETUP.md](./API_SETUP.md))

## Step-by-Step Deployment

### 1. Fork or Clone the Repository

If you haven't already:
```bash
git clone https://github.com/YOUR_USERNAME/spotify-apple-music-converter.git
cd spotify-apple-music-converter
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

For local testing:
```bash
cp .env.example .env.local
# Edit .env.local with your API credentials
```

### 4. Update Configuration

1. Edit `package.json`:
   ```json
   "homepage": "https://YOUR_USERNAME.github.io/spotify-apple-music-converter",
   ```

2. Update the redirect URI in `.env.local` for production:
   ```
   REACT_APP_REDIRECT_URI=https://YOUR_USERNAME.github.io/spotify-apple-music-converter/callback
   ```

3. Update your Spotify app settings to include the production redirect URI

### 5. Build and Test Locally

```bash
npm run build
npx serve -s build
```

Visit http://localhost:3000 to test the production build.

### 6. Deploy to GitHub Pages

```bash
npm run deploy
```

This command will:
1. Build the project
2. Create a `gh-pages` branch
3. Push the build files to that branch
4. GitHub Pages will automatically serve from this branch

### 7. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" → "Pages"
3. Under "Source", select "Deploy from a branch"
4. Select `gh-pages` branch and `/ (root)` folder
5. Click "Save"

Your app will be available at: `https://YOUR_USERNAME.github.io/spotify-apple-music-converter`

## Environment Variables in Production

### Option 1: Build-Time Variables (Simple but Less Secure)

Create a `.env.production.local` file:
```
REACT_APP_SPOTIFY_CLIENT_ID=your_production_client_id
REACT_APP_REDIRECT_URI=https://YOUR_USERNAME.github.io/spotify-apple-music-converter/callback
REACT_APP_APPLE_MUSIC_TOKEN=your_apple_music_token
```

Then build and deploy:
```bash
npm run build
npm run deploy
```

### Option 2: GitHub Actions (More Secure)

1. Go to your repository Settings → Secrets and variables → Actions
2. Add repository secrets:
   - `REACT_APP_SPOTIFY_CLIENT_ID`
   - `REACT_APP_APPLE_MUSIC_TOKEN`

3. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      env:
        REACT_APP_SPOTIFY_CLIENT_ID: ${{ secrets.REACT_APP_SPOTIFY_CLIENT_ID }}
        REACT_APP_APPLE_MUSIC_TOKEN: ${{ secrets.REACT_APP_APPLE_MUSIC_TOKEN }}
        REACT_APP_REDIRECT_URI: https://${{ github.repository_owner }}.github.io/spotify-apple-music-converter/callback
        
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./build
```

## Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to the `public` folder with your domain:
   ```
   music-converter.yourdomain.com
   ```

2. Configure DNS:
   - Add a CNAME record pointing to `YOUR_USERNAME.github.io`
   - Or use A records pointing to GitHub's IPs

3. Update environment variables and Spotify/Apple settings with new domain

## Troubleshooting

### 404 Error on Refresh

Add this to `public/404.html`:
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Spotify to Apple Music Converter</title>
    <script type="text/javascript">
      var pathSegmentsToKeep = 1;
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body>
  </body>
</html>
```

### Build Fails

- Check Node.js version (should be 14+)
- Delete `node_modules` and `package-lock.json`, then `npm install`
- Verify all environment variables are set

### Authentication Redirects Fail

- Ensure redirect URIs match exactly in:
  - Spotify app settings
  - Environment variables
  - No trailing slashes!

### Apple Music Token Issues

- Tokens expire after 6 months maximum
- Generate a new token if expired
- Verify token format (should be a long JWT string)

## Performance Optimization

### Enable Compression

GitHub Pages automatically gzips files, but ensure your build is optimized:

```bash
npm run build -- --profile
```

### Lazy Loading

The app already implements code splitting for optimal loading.

### CDN Assets

Consider hosting large assets (if any) on a CDN for better performance.

## Monitoring

### GitHub Pages Status

Check deployment status:
- Repository → Actions tab
- Repository → Settings → Pages

### Analytics (Optional)

Add Google Analytics or similar:

1. Add to `public/index.html`:
```html
<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Security Checklist

- [ ] Never commit `.env` files
- [ ] Use GitHub Secrets for sensitive data
- [ ] Regularly rotate Apple Music tokens
- [ ] Monitor for exposed credentials
- [ ] Enable 2FA on GitHub account
- [ ] Review Spotify app permissions

## Next Steps

1. Share your converter with the community
2. Add features and improvements
3. Monitor issues and pull requests
4. Keep dependencies updated
5. Consider adding more music services

For questions or issues, check the [main README](../README.md) or open a GitHub issue.