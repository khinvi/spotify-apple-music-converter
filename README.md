# Spotify to Apple Music Playlist Converter 🎵

![Status](https://img.shields.io/badge/Status-In_Progress-yellow)

A free, open-source web application that converts your Spotify playlists to Apple Music with high accuracy matching.

## 🚀 Demo

[Live Demo](https://khinvi.github.io/spotify-apple-music-converter)

## ✨ Features

- **Free & Open Source**: No hidden costs or subscriptions
- **Client-Side Only**: Your data never leaves your browser
- **High Accuracy Matching**: Multiple matching strategies including ISRC codes
- **Batch Conversion**: Convert multiple playlists at once
- **Progress Tracking**: Real-time conversion status
- **Error Recovery**: Manual search for unmatched tracks

## 🛠️ Technology Stack

- **Frontend**: React with TypeScript
- **Authentication**: OAuth 2.0 PKCE (Spotify) & MusicKit JS (Apple Music)
- **Hosting**: GitHub Pages (free)
- **APIs**: Spotify Web API & Apple Music API

## 📋 Prerequisites

Before you begin, you'll need:

1. **Spotify Developer Account** (free)
   - Register at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create an app to get your Client ID

2. **Apple Developer Account** (free for development)
   - Sign up at [Apple Developer](https://developer.apple.com)
   - Generate a MusicKit key

## 🚀 Quick Start

### For Users

1. Visit the [live demo](https://YOUR_USERNAME.github.io/spotify-apple-music-converter)
2. Click "Connect Spotify" and authorize the app
3. Click "Connect Apple Music" and sign in
4. Select playlists to convert
5. Click "Convert" and watch the magic happen!

### For Developers

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/spotify-apple-music-converter.git
cd spotify-apple-music-converter

# Install dependencies
npm install

# Create .env.local file with your credentials
echo "REACT_APP_SPOTIFY_CLIENT_ID=your_spotify_client_id" > .env.local
echo "REACT_APP_APPLE_MUSIC_KEY=your_apple_music_key" >> .env.local

# Start development server
npm start

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 🔧 Configuration

### Spotify Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add `http://localhost:3000/callback` to Redirect URIs (for development)
4. Add `https://YOUR_USERNAME.github.io/spotify-apple-music-converter/callback` (for production)
5. Copy your Client ID

### Apple Music Setup

1. Sign in to [Apple Developer](https://developer.apple.com)
2. Navigate to Certificates, Identifiers & Profiles
3. Create a new MusicKit identifier
4. Generate a private key
5. Create a developer token (see [Apple's guide](https://developer.apple.com/documentation/applemusicapi/getting_keys_and_creating_tokens))

## 🎯 How It Works

1. **Authentication**: Secure OAuth flow for both services
2. **Playlist Fetching**: Retrieves all tracks from selected Spotify playlists
3. **Track Matching**: Multi-stage algorithm:
   - ISRC code matching (highest accuracy)
   - Exact title + artist matching
   - Fuzzy matching with preprocessing
   - Manual search fallback
4. **Playlist Creation**: Creates new playlists in Apple Music
5. **Progress Tracking**: Real-time updates during conversion

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Good First Issues

- [ ] Add support for collaborative playlists
- [ ] Implement playlist artwork transfer
- [ ] Add export functionality for unmatched tracks
- [ ] Improve mobile responsive design

## 📊 Project Status

- [x] Basic authentication flow
- [x] Spotify playlist fetching
- [x] Apple Music integration
- [x] Core matching algorithm
- [ ] Batch conversion
- [ ] Advanced matching options
- [ ] Offline mode support

## 🐛 Known Issues

- Apple Music API requires active subscription
- Some region-locked tracks may not convert
- Rate limiting on large playlists (>500 tracks)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Spotify Web API documentation
- Apple MusicKit JS documentation
- Open source community for inspiration

## 📧 Contact

- Create an [issue](https://github.com/YOUR_USERNAME/spotify-apple-music-converter/issues) for bugs
- Start a [discussion](https://github.com/YOUR_USERNAME/spotify-apple-music-converter/discussions) for features
- Follow updates on [Twitter](https://twitter.com/YOUR_HANDLE)

---

Made with ❤️ by the open source community
