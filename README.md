# 🎱 The Pool Ladder - Competitive 8-Ball Tournament

[![Lighthouse Performance](https://img.shields.io/badge/Performance-90%2B-brightgreen)](https://pool-ladder.vercel.app)
[![Lighthouse Accessibility](https://img.shields.io/badge/Accessibility-95%2B-brightgreen)](https://pool-ladder.vercel.app)
[![Best Practices](https://img.shields.io/badge/Best%20Practices-100-brightgreen)](https://pool-ladder.vercel.app)
[![Security](https://img.shields.io/badge/Security-95%2B-brightgreen)](https://pool-ladder.vercel.app)

A world-class, zero-build-tool PWA for managing competitive 8-ball pool league rankings, match schedules, and results. Built with pure HTML, CSS, and JavaScript.

**Live Site**: [https://banbury-ladder-league.vercel.app](https://banbury-ladder-league.vercel.app)

---

## ✨ Features

### Public Features
- 🏆 **Live Ladder Rankings** - Real-time player standings with win/loss records
- 📅 **Match Scheduling** - Upcoming and completed match history
- 📊 **Results Tracking** - Detailed match results with scores
- 📱 **Progressive Web App** - Install on mobile/desktop, works offline
- ♿ **WCAG 2.2 AA Compliant** - Fully accessible with keyboard navigation

### Admin Features
- 👥 **Player Management** - Add, edit, remove players
- 🎯 **Match Recording** - Schedule matches and record results
- 📈 **Ranking Updates** - Drag-and-drop ladder reordering
- 💾 **GitHub Data Sync** - Persistent storage via GitHub commits
- 🔐 **Secure Authentication** - JWT-based admin access with rate limiting

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥18.x (for development server and API functions)
- **npm** or **pnpm**

### Installation

```bash
# Clone the repository
git clone https://github.com/1diegodev-coder/pool-ladder-website.git
cd pool-ladder-website

# Install dependencies
npm install

# Start development server
npm run dev
```

The site will be available at `http://localhost:3000`

### Alternative: Open Directly
For static file viewing (no API features):
```bash
# Just open in browser
open index.html
```

---

## 📁 Project Structure

```
pool-ladder-website/
├── index.html              # Homepage with hero and quick links
├── pages/                  # Individual pages
│   ├── admin.html         # Admin control panel
│   ├── ladder.html        # Player rankings
│   ├── matches.html       # Match center (schedule + results)
│   ├── login.html         # Admin authentication
│   └── rules.html         # League rules
├── css/                    # Stylesheets
│   ├── styles.css         # Global styles + theme variables
│   ├── admin.css          # Admin panel styles
│   ├── ladder.css         # Ladder page styles
│   ├── matches.css        # Match display styles
│   └── ...                # Page-specific styles
├── js/                     # JavaScript modules
│   ├── main.js            # Homepage functionality
│   ├── admin.js           # Admin panel logic (1,878 LOC)
│   ├── ladder.js          # Ladder display
│   ├── matches.js         # Match center
│   ├── results.js         # Results display
│   └── utils/             # Shared utilities
│       └── escapeHTML.js  # XSS protection
├── api/                    # Serverless API endpoints (Vercel)
│   ├── login.js           # JWT authentication
│   ├── publish.js         # GitHub data publishing
│   └── verify.js          # Token verification
├── data/                   # JSON data files
│   ├── players.json       # Player records
│   ├── matches.json       # Match history
│   └── meta.json          # Metadata
├── icons/                  # PWA icons (SVG)
├── sw.js                   # Service Worker (offline support)
├── manifest.json           # PWA manifest
├── vercel.json             # Deployment configuration
└── package.json            # Dependencies
```

---

## 🔧 Development

### Local Development Server

```bash
# Start Vercel dev server (with API functions)
npm run dev

# Alternative: Python HTTP server (static only)
python3 -m http.server 8000
```

### Environment Variables

Create a `.env` file (see `.env.example`):

```env
# Admin authentication
ADMIN_PASSWORD_HASH=salt:hash
JWT_SECRET=your-secret-key-here

# GitHub integration
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
GITHUB_OWNER=your-username
GITHUB_REPO=pool-ladder-website
GITHUB_BRANCH=main

# Deployment
VERCEL_DEPLOY_HOOK_URL=https://api.vercel.com/v1/integrations/...
```

**Generate password hash:**
```bash
node -e "const crypto = require('crypto'); const salt = crypto.randomBytes(16).toString('hex'); const hash = crypto.pbkdf2Sync('YOUR_PASSWORD', salt, 10000, 64, 'sha512').toString('hex'); console.log(salt + ':' + hash);"
```

### Making Changes

1. **Edit HTML/CSS/JS** - Changes are immediately reflected (no build step)
2. **Test locally** - Refresh browser to see updates
3. **Commit changes** - Follow [Conventional Commits](https://www.conventionalcommits.org/)
4. **Push to deploy** - Vercel auto-deploys on push to `main`

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Homepage loads and displays hero section
- [ ] Ladder page shows player rankings
- [ ] Match center displays scheduled/completed matches
- [ ] Admin login works with correct credentials
- [ ] Admin can add/edit/remove players
- [ ] Admin can record match results
- [ ] PWA install prompt appears
- [ ] Offline mode works (visit page, disconnect, reload)

### XSS Protection Testing

```javascript
// In browser console on admin page:
import { testEscaping } from './utils/escapeHTML.js';
testEscaping(); // Should show "✅ All tests passed"
```

### Accessibility Testing

```bash
# Install axe DevTools browser extension
# Scan pages for WCAG violations
# Expected: 0 critical/serious issues
```

### Performance Testing

```bash
# Run Lighthouse
lighthouse https://banbury-ladder-league.vercel.app --view

# Expected scores:
# Performance: ≥90
# Accessibility: ≥95
# Best Practices: 100
# SEO: 100
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect GitHub repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Automatic on push to `main`

```bash
# Manual deployment
npm run deploy
```

### Environment Variables (Vercel Dashboard)

Add these in **Settings → Environment Variables**:

- `ADMIN_PASSWORD_HASH`
- `JWT_SECRET`
- `GITHUB_TOKEN`
- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_BRANCH`
- `VERCEL_DEPLOY_HOOK_URL` (optional, for auto-refresh)

### Custom Domain

In Vercel dashboard: **Settings → Domains → Add Domain**

---

## 📚 Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design decisions
- **[SECURITY.md](SECURITY.md)** - Security policies and vulnerability reporting
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment guide and environment setup
- **[CLAUDE.md](CLAUDE.md)** - AI coding assistant guidelines
- **[reports/](reports/)** - Audit reports and upgrade plans

---

## 🔐 Security

### Implemented Security Features

- ✅ **XSS Protection** - HTML escaping on all user input
- ✅ **Rate Limiting** - 5 login attempts per 15 minutes
- ✅ **Security Headers** - CSP, X-Frame-Options, HSTS, etc.
- ✅ **JWT Authentication** - Secure admin access with 24h expiration
- ✅ **Input Validation** - Server-side validation on all API endpoints
- ✅ **No Secrets in Repo** - All sensitive data in environment variables

### Reporting Vulnerabilities

See [SECURITY.md](SECURITY.md) for responsible disclosure process.

**Quick contact**: [fasteddiespoolleague@proton.me](mailto:fasteddiespoolleague@proton.me)

---

## ♿ Accessibility

### WCAG 2.2 AA Compliance

- ✅ **Semantic HTML** - Proper landmarks and heading hierarchy
- ✅ **ARIA Labels** - All interactive elements properly labeled
- ✅ **Keyboard Navigation** - Full site accessible via keyboard
- ✅ **Focus Indicators** - Visible 3px cyan outline on all focusable elements
- ✅ **Skip Links** - "Skip to main content" for screen readers
- ✅ **Color Contrast** - All text meets WCAG AA contrast ratios
- ✅ **Reduced Motion** - Respects `prefers-reduced-motion` preference
- ✅ **Screen Reader Support** - Tested with NVDA and VoiceOver

### Testing Accessibility

```bash
# Install axe DevTools
# Chrome: https://chrome.google.com/webstore/detail/axe-devtools/lhdoppojpmngadmnindnejefpokejbdd
# Firefox: https://addons.mozilla.org/en-US/firefox/addon/axe-devtools/

# Scan pages
# Expected: 0 critical/serious violations
```

---

## 🎨 Theming

### CSS Custom Properties

Edit `:root` in `css/styles.css`:

```css
:root {
    /* Colors */
    --electric-cyan: #008080;
    --neon-green: #4cff4c;
    --chrome-silver: #d4d7d4;
    --deep-charcoal: #1a1a1a;
    
    /* Typography */
    --font-primary: 'Inter', sans-serif;
    --font-display: 'Montserrat', sans-serif;
    
    /* Spacing */
    --spacing-md: clamp(1rem, 2vw, 1.25rem);
}
```

### Dark Theme

The site uses a dark tournament theme by default. All colors are defined as CSS variables for easy customization.

---

## 🏗️ Architecture

### Zero-Build Philosophy

This project intentionally avoids build tools (Webpack, Vite, etc.) for:
- ✅ **Simplicity** - Open `index.html` to develop
- ✅ **Speed** - No compilation, instant refresh
- ✅ **Transparency** - View source shows actual code
- ✅ **Maintainability** - No complex toolchain
- ✅ **Accessibility** - Easy for new contributors

### Data Flow

```
User Actions (Browser)
    ↓
JS Modules (ES6 imports)
    ↓
localStorage (Admin edits)
    ↓
/api/publish.js (Serverless)
    ↓
GitHub API (Commit to repo)
    ↓
/data/*.json (Updated)
    ↓
Vercel Auto-Deploy
    ↓
Public Pages (Updated)
```

### PWA Features

- **Service Worker** (`sw.js`) - Caches pages/assets for offline use
- **Web App Manifest** - Installable on mobile/desktop
- **Offline Fallback** - Shows offline.html when disconnected
- **Background Sync** - Syncs data when connection restored

---

## 📊 Performance

### Current Metrics (Lighthouse Mobile)

| Metric | Score | Target | Status |
|--------|-------|--------|--------|
| Performance | 90/100 | ≥90 | ✅ |
| Accessibility | 95/100 | ≥95 | ✅ |
| Best Practices | 100/100 | ≥95 | ✅ |
| SEO | 100/100 | ≥95 | ✅ |

### Core Web Vitals

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| LCP (Largest Contentful Paint) | 3.0s | ≤2.5s | 🟡 |
| CLS (Cumulative Layout Shift) | 0 | ≤0.1 | ✅ |
| TBT (Total Blocking Time) | 0ms | ≤200ms | ✅ |

### Bundle Sizes

- **JavaScript**: ~200 KB (within target)
- **CSS**: ~140 KB (optimization in progress)
- **HTML**: ~50 KB
- **Fonts**: External (Google Fonts CDN)

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Code style guidelines
- Commit message format
- Pull request process
- Testing requirements

### Quick Contribution Guide

1. **Fork** the repository
2. **Create branch**: `git checkout -b feature/my-feature`
3. **Make changes** and test locally
4. **Commit**: `git commit -m "feat: add my feature"`
5. **Push**: `git push origin feature/my-feature`
6. **Create Pull Request** on GitHub

### Coding Standards

- ✅ **Vanilla JS** - No frameworks, use ES6+ features
- ✅ **Semantic HTML** - Proper landmarks and accessibility
- ✅ **CSS Custom Properties** - Use theme variables
- ✅ **XSS Protection** - Always escape user input with `escapeHTML()`
- ✅ **Conventional Commits** - Use `feat:`, `fix:`, `docs:`, etc.

---

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Ultimate Pool Group** - League rules and regulations
- **EmailJS** - Form submission service
- **Vercel** - Hosting and serverless functions
- **Google Fonts** - Inter, Montserrat, Orbitron typefaces

---

## 📞 Contact

- **Email**: [fasteddiespoolleague@proton.me](mailto:fasteddiespoolleague@proton.me)
- **Issues**: [GitHub Issues](https://github.com/1diegodev-coder/pool-ladder-website/issues)

---

## 🗺️ Roadmap

### Completed ✅
- [x] PWA with offline support
- [x] Admin panel with player/match management
- [x] JWT authentication with rate limiting
- [x] XSS protection and security headers
- [x] WCAG 2.2 AA accessibility compliance
- [x] Lighthouse 90+ scores across all categories

### Planned (Future)
- [ ] TypeScript gradual adoption (JSDoc annotations)
- [ ] E2E testing with Playwright
- [ ] Player profile pages with statistics
- [ ] Tournament bracket generator
- [ ] Mobile app (React Native or enhanced PWA)
- [ ] Multi-language support (i18n)

---

**Built with ❤️ for competitive pool players**

*Last updated: 2025-10-31*
