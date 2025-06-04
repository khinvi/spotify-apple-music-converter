# API Setup Guide

This guide will walk you through setting up the necessary API credentials for both Spotify and Apple Music.

## Table of Contents
- [Spotify API Setup](#spotify-api-setup)
- [Apple Music API Setup](#apple-music-api-setup)
- [Environment Configuration](#environment-configuration)

## Spotify API Setup

### 1. Create a Spotify Developer Account

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account (or create one if you don't have one)
3. Accept the Developer Terms of Service

### 2. Create a New App

1. Click "Create app" in the dashboard
2. Fill in the app details:
   - **App name**: `Spotify to Apple Music Converter`
   - **App description**: `Convert playlists from Spotify to Apple Music`
   - **Website**: Your GitHub repository URL
   - **Redirect URIs**: 
     - For development: `http://localhost:3000/callback`
     - For production: `https://YOUR_USERNAME.github.io/spotify-apple-music-converter/callback`
3. Check "Web API" under "Which API/SDKs are you planning to use?"
4. Agree to the Developer Terms of Service
5. Click "Save"

### 3. Get Your Client ID

1. In your app settings, you'll see your **Client ID**
2. Copy this value - you'll need it for the `.env.local` file
3. Note: You do NOT need the Client Secret for this app (we use PKCE flow)

### 4. Configure Redirect URIs

1. In your app settings, click "Edit Settings"
2. Under "Redirect URIs", make sure you have both:
   - `http://localhost:3000/callback` (for local development)
   - `https://YOUR_USERNAME.github.io/spotify-apple-music-converter/callback` (for production)
3. Click "Save"

## Apple Music API Setup

### 1. Join the Apple Developer Program

1. Go to [Apple Developer](https://developer.apple.com)
2. Sign in with your Apple ID
3. For development only, you can use a free account
4. For app distribution, you'll need a paid account ($99/year)

### 2. Create a MusicKit Identifier

1. Go to [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list)
2. Click the "+" button to create a new identifier
3. Select "MusicKit IDs" and click "Continue"
4. Enter a description: `Spotify Apple Music Converter`
5. Enter an identifier: `com.yourname.spotify-apple-converter`
6. Click "Continue" then "Register"

### 3. Create a Private Key

1. Go to [Keys](https://developer.apple.com/account/resources/authkeys/list)
2. Click the "+" button to create a new key
3. Enter a name: `Spotify Apple Music Converter Key`
4. Check "MusicKit"
5. Click "Continue" then "Register"
6. Download the private key file (you can only download it once!)
7. Note the Key ID - you'll need this

### 4. Generate a Developer Token

You'll need to create a JWT token using your private key. Here's how:

#### Option 1: Use the Token Generator Script

Create a file called `generate-token.js`:

```javascript
const jwt = require('jsonwebtoken');
const fs = require('fs');

// Configuration
const TEAM_ID = 'YOUR_TEAM_ID'; // Found in Apple Developer account
const KEY_ID = 'YOUR_KEY_ID'; // From step 3
const PRIVATE_KEY_PATH = './AuthKey_YOUR_KEY_ID.p8'; // Path to your private key

// Read the private key
const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');

// Generate token
const token = jwt.sign({}, privateKey, {
  algorithm: 'ES256',
  expiresIn: '180d',
  issuer: TEAM_ID,
  header: {
    alg: 'ES256',
    kid: KEY_ID
  }
});

console.log('Your Apple Music Developer Token:');
console.log(token);
```

Run it:
```bash
npm install jsonwebtoken
node generate-token.js
```

#### Option 2: Use Apple's Token Generator

Apple provides example code in various languages:
- [Swift example](https://developer.apple.com/documentation/applemusicapi/generating_developer_tokens)
- [Python example](https://github.com/pelauimagineering/apple-music-token-generator)

### 5. Important Notes

- Developer tokens expire after 6 months maximum
- Store your private key securely - you can't download it again
- For production apps, generate tokens server-side
- User tokens (different from developer tokens) are handled by MusicKit JS

## Environment Configuration

### 1. Create `.env.local` File

In your project root, create a `.env.local` file:

```bash
cp .env.example .env.local
```

### 2. Add Your Credentials

Edit `.env.local` with your actual values:

```
REACT_APP_SPOTIFY_CLIENT_ID=your_actual_spotify_client_id
REACT_APP_REDIRECT_URI=http://localhost:3000/callback
REACT_APP_APPLE_MUSIC_TOKEN=your_actual_apple_music_token
```

### 3. Update for Production

For production deployment, update the redirect URI:
```
REACT_APP_REDIRECT_URI=https://YOUR_USERNAME.github.io/spotify-apple-music-converter/callback
```

## Troubleshooting

### Spotify Issues

**Invalid redirect URI error**
- Make sure the redirect URI in your app exactly matches what's in your Spotify app settings
- Check for trailing slashes - they matter!

**Authentication fails**
- Verify your Client ID is correct
- Make sure you're not using the Client Secret (not needed for PKCE)

### Apple Music Issues

**MusicKit won't initialize**
- Check that your developer token is valid and not expired
- Verify the token was generated with the correct Team ID and Key ID
- Make sure MusicKit JS is loaded before trying to configure it

**Cannot create playlists**
- User must have an active Apple Music subscription
- User must be signed in to Apple Music in their browser

**Token expired**
- Developer tokens last maximum 6 months
- Generate a new token and update your `.env.local`

## Security Best Practices

1. **Never commit `.env.local` to version control**
   - It's already in `.gitignore`
   - Use GitHub Secrets for production

2. **Rotate tokens regularly**
   - Apple Music tokens expire after 6 months
   - Generate new tokens before expiry

3. **Use environment variables**
   - Never hardcode credentials in your source code
   - Use different credentials for development and production

4. **Secure your Apple private key**
   - Store it securely
   - Never share or commit it
   - You can only download it once from Apple

## Next Steps

Once you have your API credentials set up:

1. Run `npm install` to install dependencies
2. Run `npm start` to start the development server
3. Test the authentication flow for both services
4. Deploy to GitHub Pages with `npm run deploy`

For more help, check the [main README](../README.md) or open an issue on GitHub.