# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a competitive pool ladder tournament website featuring a modern, dark-themed design with neon accents. The site includes both public-facing pages and a comprehensive admin panel for tournament management.

## Architecture & Structure

### Frontend Architecture
- **Pure HTML/CSS/JavaScript** - No build tools or frameworks required
- **Page-based routing** - Each page is a separate HTML file in `/pages/`
- **Modular JavaScript** - Each page has its own JS file with shared utilities
- **CSS Custom Properties** - Consistent theming using CSS variables in `:root`

### File Organization
```
/
├── index.html              # Homepage with hero section and live stats
├── pages/                  # Individual page templates
│   ├── admin.html         # Admin control panel
│   ├── ladder.html        # Player rankings
│   ├── schedule.html      # Match scheduling
│   └── results.html       # Match results
├── css/                   # Page-specific and shared styles
│   ├── styles.css         # Global styles and theme variables
│   └── [page].css         # Page-specific styling
└── js/                    # JavaScript modules
    ├── main.js            # Homepage functionality
    ├── admin.js           # Admin panel logic
    └── [page].js          # Page-specific functionality
```

### Data Management
- **localStorage-based persistence** - All admin data stored in browser localStorage
- **JSON data structure** - Player data, matches, and configuration stored as structured objects
- **No backend required** - Fully client-side data management

### Admin System Architecture
The admin panel (`/pages/admin.html` + `/js/admin.js`) features:

- **Global Data Store**: `adminData` object containing players, matches, and config
- **Modular Tab System**: Dashboard, Players, Matches, Ladder, Content, Reports
- **CRUD Operations**: Full Create, Read, Update, Delete for all entities
- **Bulk Operations**: Multi-select actions for player management
- **Import/Export**: JSON-based data portability
- **Real-time Updates**: Live statistics and activity feeds

#### Key Admin Functions
- `loadAdminData()` / `saveAdminData()` - Data persistence
- `renderPlayersTable()` - Dynamic table rendering with actions
- `handleAddPlayer()` - Form validation and player creation
- `togglePlayerStatus()` - Status management (active/suspended/inactive)
- `exportPlayers()` / `importPlayers()` - Data portability

## Styling System

### CSS Custom Properties (Theme Variables)
Located in `/css/styles.css` `:root`:
- **Colors**: Dark tournament theme with electric cyan, neon green accents
- **Typography**: Inter (primary), Montserrat (display), Orbitron (accent)
- **Spacing**: Consistent rem-based spacing scale

### Component Patterns
- **Cards**: `.card`, `.player-card`, `.match-card` for content containers
- **Buttons**: `.btn` with modifiers (`.btn-primary`, `.btn-outline`, `.btn-danger`)
- **Tables**: `.admin-table` with sortable headers and action buttons
- **Modals**: Overlay system with `.modal`, `.modal-content`, `.modal-header`

## Development Commands

### Running the Site
```bash
# Open in browser (no build process required)
open index.html

# Open specific pages
open pages/admin.html
open pages/ladder.html
```

### Local Development
Since this is a static site, use any local server:
```bash
# Python 3
python -m http.server 8000

# Node.js (if http-server is installed)
npx http-server

# VS Code Live Server extension
# Right-click on index.html -> "Open with Live Server"
```

## Key Implementation Notes

### Admin Panel Data Structure
```javascript
adminData = {
    players: [
        {
            id: number,
            name: string,
            email: string,
            nickname: string,
            rank: number,
            wins: number,
            losses: number,
            points: number,
            status: 'active' | 'suspended' | 'inactive',
            phone: string,
            notes: string,
            created: ISO_DATE,
            lastActive: ISO_DATE
        }
    ],
    matches: [],
    config: {
        pointsPerWin: 50,
        pointsPerLoss: -25,
        bonusMultiplier: 1.5,
        minimumGames: 3
    }
}
```

### Modal System
- Modals are opened via `openModal(type)` and closed via `closeModal(type)`
- Dynamic modal creation for edit operations
- Global escape key handling and click-outside-to-close

### Inline Editing
- Double-click any `.editable` element to edit in place
- Enter to save, Escape to cancel
- Automatic validation based on field type

### Search & Filtering
- Real-time search across player name, email, and nickname
- Status filtering with dropdown selection
- Results update automatically without page refresh

## Working with This Codebase

### Adding New Pages
1. Create HTML file in `/pages/`
2. Create corresponding CSS file in `/css/`
3. Create corresponding JS file in `/js/`
4. Update navigation in all existing pages' headers

### Modifying Admin Features
- All admin logic is in `/js/admin.js`
- Data persistence handled automatically via `saveAdminData()`
- UI updates use `renderPlayersTable()` and similar render functions
- New tabs require updates to `initializeAdminTabs()`

### Styling Updates
- Global changes go in `/css/styles.css`
- Page-specific styles in individual CSS files
- Use existing CSS custom properties for consistency
- Follow the established `.btn`, `.card`, `.badge` patterns

### Data Management
- All changes automatically persist to localStorage
- Export/import functionality for data backup
- No server-side API calls - everything is client-side