# Contributing to Spotify to Apple Music Converter

First off, thank you for considering contributing to this project! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Style Guide](#style-guide)
- [Testing](#testing)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [email].

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/spotify-apple-music-converter.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Push to your fork: `git push origin feature/your-feature-name`
6. Create a Pull Request

## 💻 Development Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Spotify Developer Account
- Apple Developer Account (free tier works)

### Local Development

```bash
# Install dependencies
npm install

# Create .env.local with your API keys
cp .env.example .env.local

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

### Environment Variables

Create a `.env.local` file with:

```
REACT_APP_SPOTIFY_CLIENT_ID=your_spotify_client_id
REACT_APP_REDIRECT_URI=http://localhost:3000/callback
REACT_APP_APPLE_MUSIC_KEY=your_apple_music_key
```

## 🤝 How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Your environment (browser, OS, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- A clear and descriptive title
- A detailed description of the proposed functionality
- Why this enhancement would be useful
- Possible implementation approach

### Good First Issues

Look for issues labeled `good first issue` - these are great for newcomers!

## 🔄 Pull Request Process

1. **Update Documentation**: Update the README.md with details of changes if needed
2. **Add Tests**: Ensure your code has appropriate test coverage
3. **Follow Style Guide**: Run `npm run lint` to check code style
4. **Update Version**: Update version numbers following [SemVer](http://semver.org/)
5. **Request Review**: Tag maintainers for review

### PR Title Format

Use conventional commits format:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

Example: `feat: add batch playlist conversion`

## 🎨 Style Guide

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

```typescript
// Good
const findMatchingTrack = async (spotifyTrack: SpotifyTrack): Promise<AppleTrack | null> => {
  // Search logic here
};

// Avoid
const find = async (t: any) => {
  // ...
};
```

### React Components

- Use functional components with hooks
- Keep components small and reusable
- Use TypeScript interfaces for props
- Document complex components

```typescript
interface PlaylistCardProps {
  playlist: Playlist;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ 
  playlist, 
  onSelect, 
  isSelected 
}) => {
  // Component implementation
};
```

### CSS/Styling

- Use CSS Modules or styled-components
- Follow BEM naming convention
- Keep styles modular and reusable
- Support dark mode where possible

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Writing Tests

- Write tests for all new features
- Aim for >80% code coverage
- Test edge cases
- Use meaningful test descriptions

```typescript
describe('TrackMatcher', () => {
  it('should match tracks by ISRC code', async () => {
    // Test implementation
  });

  it('should fallback to fuzzy matching when ISRC fails', async () => {
    // Test implementation
  });
});
```

## 📝 Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for public APIs
- Update architecture docs for significant changes
- Include examples in documentation

## 🎯 Areas for Contribution

### High Priority

- Improve track matching accuracy
- Add support for more music services
- Implement offline mode
- Performance optimizations

### Feature Ideas

- Playlist sync (keep playlists updated)
- Multiple account support
- Export/import functionality
- Browser extension version

### Documentation

- Improve setup guides
- Add video tutorials
- Translate to other languages
- Create troubleshooting guide

## 💬 Communication

- Use GitHub Issues for bug reports and features
- Join our [Discord server](link) for discussions
- Follow our [Twitter](link) for updates
- Check [Discussions](link) for Q&A

## 🏆 Recognition

Contributors will be:
- Listed in our README
- Given credit in release notes
- Invited to our contributors Discord channel

Thank you for making this project better! 🙌