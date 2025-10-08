// Matches Page JavaScript - Combines schedule and results functionality

document.addEventListener('DOMContentLoaded', async function() {
    await loadAndDisplayMatches();
    initializeFilters();
    initializeViewToggle();

    console.log('Matches page initialized');
});

// Global variables
let allScheduledMatches = [];
let allCompletedMatches = [];
let displayedScheduledMatches = [];
let displayedCompletedMatches = [];
let currentTab = 'scheduled';

// Load data from JSON files
async function loadAdminData() {
    try {
        const [playersRes, matchesRes] = await Promise.all([
            fetch('/data/players.json'),
            fetch('/data/matches.json')
        ]);

        const players = await playersRes.json();
        const matches = await matchesRes.json();

        return { players: players || [], matches: matches || [] };
    } catch (error) {
        console.error('Error loading data from JSON files:', error);
        return { players: [], matches: [] };
    }
}

// Load and display all matches
async function loadAndDisplayMatches() {
    const adminData = await loadAdminData();
    
    // Get scheduled matches
    allScheduledMatches = adminData.matches
        .filter(match => match.status === 'scheduled')
        .sort((a, b) => {
            const dateA = a.match_date || a.date;
            const timeA = a.match_time || a.time;
            const dateB = b.match_date || b.date;
            const timeB = b.match_time || b.time;
            return new Date(dateA + ' ' + timeA) - new Date(dateB + ' ' + timeB);
        }); // Earliest first
    
    // Get completed matches and enrich with player data
    allCompletedMatches = adminData.matches
        .filter(match => match.status === 'completed')
        .sort((a, b) => {
            const dateA = new Date(a.completed_at || a.completedDate);
            const dateB = new Date(b.completed_at || b.completedDate);
            return dateB - dateA; // Most recent first
        })
        .map(match => {
            // Handle both database format and localStorage format
            const player1Id = match.player1_id || match.player1?.id;
            const player2Id = match.player2_id || match.player2?.id;
            const player1 = adminData.players.find(p => p.id === player1Id);
            const player2 = adminData.players.find(p => p.id === player2Id);
            
            return {
                ...match,
                player1: {
                    id: player1Id,
                    name: match.player1_name || match.player1?.name || 'Player 1',
                    rank: player1 ? player1.rank : null
                },
                player2: {
                    id: player2Id,
                    name: match.player2_name || match.player2?.name || 'Player 2',
                    rank: player2 ? player2.rank : null
                },
                // Add compatibility fields
                completedDate: match.completed_at || match.completedDate,
                player1Score: match.player1_score || match.player1Score || 0,
                player2Score: match.player2_score || match.player2Score || 0
            };
        });
    
    displayedScheduledMatches = [...allScheduledMatches];
    displayedCompletedMatches = [...allCompletedMatches];

    // Render both sections
    renderScheduledMatches();
    renderCompletedMatches();
}

// Removed tab switching code - both sections now always visible

// Render scheduled matches
function renderScheduledMatches() {
    const container = document.getElementById('scheduledMatches');
    if (!container) return;
    
    if (displayedScheduledMatches.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No scheduled matches found. Matches will appear here when they are scheduled through the admin panel.</p>
            </div>
        `;
        return;
    }
    
    const matchesHTML = displayedScheduledMatches.map(match => createScheduledMatchCard(match)).join('');
    container.innerHTML = matchesHTML;
}

// Render completed matches (results)
function renderCompletedMatches() {
    const container = document.getElementById('matchResults');
    if (!container) return;
    
    if (displayedCompletedMatches.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No completed matches found. Results will appear here when matches are recorded through the admin panel.</p>
            </div>
        `;
        return;
    }
    
    const matchesHTML = displayedCompletedMatches.map(match => createResultCard(match)).join('');
    container.innerHTML = matchesHTML;
}

// Create scheduled match card HTML
function createScheduledMatchCard(match) {
    // Handle both database format and localStorage format
    const matchDateStr = match.match_date || match.date;
    const matchTimeStr = match.match_time || match.time;
    const matchDate = new Date(matchDateStr + ' ' + matchTimeStr);
    const formattedDate = matchDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const formattedTime = matchDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
    
    const isToday = new Date().toDateString() === matchDate.toDateString();
    const isPast = matchDate < new Date();
    
    return `
        <div class="scheduled-match-card">
            <div class="match-players">
                <div class="scheduled-player">
                    <div class="scheduled-player-details">
                        <div class="scheduled-player-name">${match.player1_name || match.player1?.name || 'Player 1'}</div>
                    </div>
                </div>

                <div class="vs-indicator">VS</div>

                <div class="scheduled-player right">
                    <div class="scheduled-player-details">
                        <div class="scheduled-player-name">${match.player2_name || match.player2?.name || 'Player 2'}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Create result card HTML (similar to results.js but adapted for matches page)
function createResultCard(match) {
    if (!match || !match.winner_id) {
        console.warn('Invalid match data:', match);
        return '';
    }

    // Determine winner and loser from match data
    const isPlayer1Winner = match.winner_id === match.player1_id || match.player1_score > match.player2_score;
    const winnerName = isPlayer1Winner ? (match.player1_name || match.winner_name) : (match.player2_name || match.loser_name);
    const loserName = isPlayer1Winner ? (match.player2_name || match.loser_name) : (match.player1_name || match.winner_name);
    const winnerScore = isPlayer1Winner ? match.player1_score : match.player2_score;
    const loserScore = isPlayer1Winner ? match.player2_score : match.player1_score;

    return `
        <div class="result-card">
            <div class="result-matchup">
                <div class="player-result winner">
                    <div class="player-info">
                        <div class="player-details">
                            <span class="player-name">${winnerName}</span>
                        </div>
                    </div>
                    <div class="score-info">
                        <div class="final-score winner-score">${winnerScore}</div>
                    </div>
                </div>

                <div class="vs-divider">
                    <span class="vs-text">DEFEATED</span>
                </div>

                <div class="player-result loser">
                    <div class="score-info">
                        <div class="final-score loser-score">${loserScore}</div>
                    </div>
                    <div class="player-info">
                        <div class="player-details">
                            <span class="player-name">${loserName}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Get player initials for avatar
function getPlayerInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

// Get time ago string
function getTimeAgo(date) {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'TODAY';
    if (diffDays === 2) return 'YESTERDAY';
    if (diffDays <= 7) return `${diffDays} DAYS AGO`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} WEEKS AGO`;
    return `${Math.ceil(diffDays / 30)} MONTHS AGO`;
}

// Initialize filters (removed - no filter controls in current UI)
function initializeFilters() {
    // Filter controls removed from UI
}

// Initialize view toggle
function initializeViewToggle() {
    const viewButtons = document.querySelectorAll('.view-options .btn');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const view = this.dataset.view;
            
            // Update button states
            viewButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Apply view styles
            const matchCards = document.querySelectorAll('.scheduled-match-card, .result-card');
            
            if (view === 'compact') {
                matchCards.forEach(card => {
                    card.classList.add('compact-view');
                });
            } else {
                matchCards.forEach(card => {
                    card.classList.remove('compact-view');
                });
            }
        });
    });
}

// Player stats modal
async function showPlayerStatsModal(playerName) {
    const adminData = await loadAdminData();
    const player = adminData.players.find(p => p.name === playerName);
    
    if (!player) {
        alert(`Player "${playerName}" not found.`);
        return;
    }
    
    const playerMatches = allCompletedMatches.filter(match => 
        match.player1.name === playerName || match.player2.name === playerName
    );
    
    const wins = playerMatches.filter(match => match.winner.name === playerName).length;
    const losses = playerMatches.length - wins;
    
    alert(`Player Stats for ${playerName}\n\nRank: #${player.rank}\nWins: ${wins}\nLosses: ${losses}\nTotal Matches: ${playerMatches.length}`);
}

// Click handlers for player names
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('player-name') || 
        e.target.classList.contains('scheduled-player-name')) {
        const playerName = e.target.textContent;
        showPlayerStatsModal(playerName);
    }
});

// Auto-refresh matches every 30 seconds to pick up new data
setInterval(async () => {
    const newAdminData = await loadAdminData();
    const newScheduledMatches = newAdminData.matches.filter(m => m.status === 'scheduled');
    const newCompletedMatches = newAdminData.matches.filter(m => m.status === 'completed');
    
    if (newScheduledMatches.length !== allScheduledMatches.length ||
        newCompletedMatches.length !== allCompletedMatches.length) {
        loadAndDisplayMatches();
        showNotification('Match data updated!', 'success');
    }
}, 30000);

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--obsidian-black);
        border: 2px solid var(--electric-cyan);
        border-radius: 8px;
        padding: 1rem 1.5rem;
        color: var(--chrome-silver);
        z-index: 10000;
        animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s;
        max-width: 300px;
        box-shadow: 0 4px 20px rgba(0, 212, 255, 0.3);
    `;
    
    if (type === 'success') {
        notification.style.borderColor = 'var(--neon-green)';
        notification.style.boxShadow = '0 4px 20px rgba(57, 255, 20, 0.3)';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            document.body.removeChild(notification);
        }
    }, 3000);
}

// Add custom styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeOut {
        to { opacity: 0; transform: translateX(100%); }
    }
    
    .compact-view {
        padding: var(--spacing-lg) !important;
    }
    
    .compact-view .match-info {
        display: none !important;
    }
    
    .player-name:hover,
    .scheduled-player-name:hover {
        color: var(--electric-cyan) !important;
        cursor: pointer;
        text-decoration: underline;
    }
    
    .scheduled-match-card.today::before {
        background: var(--neon-green);
        box-shadow: 0 0 15px var(--neon-green);
    }
    
    .scheduled-match-card.past {
        opacity: 0.7;
    }
    
    .scheduled-match-card.past::before {
        background: var(--crimson-red);
        box-shadow: 0 0 15px var(--crimson-red);
    }
    
    .match-status.today {
        background: var(--neon-green);
        color: var(--obsidian-black);
    }
    
    .match-status.past {
        background: var(--crimson-red);
        color: white;
    }
`;
document.head.appendChild(style);