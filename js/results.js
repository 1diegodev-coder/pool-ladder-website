// Results Page JavaScript - Loads real match data from admin system

document.addEventListener('DOMContentLoaded', function() {
    loadAndDisplayMatches();
    initializeResultsFilters();
    
    console.log('Results page initialized with real match data');
});

// Global variables
let allMatches = [];
let displayedMatches = [];

// Load completed matches from admin system
function loadAndDisplayMatches() {
    const adminData = loadAdminData();
    allMatches = getCompletedMatches(adminData);
    displayedMatches = [...allMatches];
    
    renderMatches(displayedMatches);
    updateMatchCount();
}

// Load admin data from localStorage
function loadAdminData() {
    try {
        const savedData = localStorage.getItem('poolLadderAdminData');
        if (savedData) {
            return JSON.parse(savedData);
        }
    } catch (error) {
        console.error('Error loading admin data:', error);
    }
    return { players: [], matches: [] };
}

// Get completed matches and enrich with player data
function getCompletedMatches(adminData) {
    const completedMatches = adminData.matches
        .filter(match => match.status === 'completed')
        .sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate)); // Most recent first
    
    // Enrich matches with player rank information
    return completedMatches.map(match => {
        const player1 = adminData.players.find(p => p.id === match.player1.id);
        const player2 = adminData.players.find(p => p.id === match.player2.id);
        
        return {
            ...match,
            player1: {
                ...match.player1,
                rank: player1 ? player1.rank : null,
                points: player1 ? player1.points : null
            },
            player2: {
                ...match.player2,
                rank: player2 ? player2.rank : null,
                points: player2 ? player2.points : null
            }
        };
    });
}

// Render matches to the page
function renderMatches(matches) {
    const resultsInfo = document.querySelector('.results-info');
    if (!resultsInfo) return;
    
    if (matches.length === 0) {
        resultsInfo.innerHTML = `
            <p class="empty-state">No matches completed yet. Results will appear here when matches are recorded through the admin panel.</p>
        `;
        return;
    }
    
    const matchesHTML = matches.map(match => createMatchCard(match)).join('');
    resultsInfo.innerHTML = `
        <div class="results-list">
            ${matchesHTML}
        </div>
        <div class="load-more-section">
            <div class="pagination-info">Showing ${matches.length} matches</div>
        </div>
    `;
}

// Create HTML for a single match card
function createMatchCard(match) {
    const matchDate = new Date(match.completedDate);
    const formattedDate = matchDate.toLocaleDateString();
    const formattedTime = matchDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
    
    const winner = match.winner;
    const loser = match.loser;
    const winnerScore = winner.id === match.player1.id ? match.player1Score : match.player2Score;
    const loserScore = winner.id === match.player1.id ? match.player2Score : match.player1Score;
    
    // Determine if this was an upset (lower-ranked player beat higher-ranked player)
    const isUpset = winner.rank > loser.rank && winner.rank && loser.rank;
    const isRecentMatch = (new Date() - matchDate) < 24 * 60 * 60 * 1000; // Less than 24 hours
    
    return `
        <div class="result-card ${isUpset ? 'upset' : ''}">
            ${isUpset || isRecentMatch ? `
                <div class="result-badges">
                    ${isUpset ? '<span class="badge upset-badge">UPSET</span>' : ''}
                    ${isRecentMatch ? '<span class="badge recent-badge">RECENT</span>' : ''}
                    <span class="badge time-badge">${getTimeAgo(matchDate)}</span>
                </div>
            ` : ''}
            
            <div class="result-header">
                <div class="match-info">
                    <span class="match-type">Regular Season</span>
                    <span class="match-date">${formattedDate}</span>
                </div>
                <div class="match-duration">${formattedTime}</div>
            </div>
            
            <div class="result-matchup">
                <div class="player-result winner">
                    <div class="player-info">
                        <div class="player-avatar ${isUpset && winner.rank > loser.rank ? 'upset-winner' : ''}">
                            ${getPlayerInitials(winner.name)}
                        </div>
                        <div class="player-details">
                            <span class="player-name">${winner.name}</span>
                            <span class="player-rank">${winner.rank ? `Rank #${winner.rank}` : 'Unranked'}</span>
                        </div>
                    </div>
                    <div class="score-info">
                        <div class="final-score winner-score">${winnerScore}</div>
                        <div class="points-change positive">+50 pts</div>
                    </div>
                </div>
                
                <div class="vs-divider">
                    <span class="vs-text">DEFEATED</span>
                    <div class="frame-scores">
                        <span class="frame">${winnerScore}-${loserScore}</span>
                    </div>
                </div>
                
                <div class="player-result loser">
                    <div class="score-info">
                        <div class="final-score loser-score">${loserScore}</div>
                        <div class="points-change negative">-25 pts</div>
                    </div>
                    <div class="player-info">
                        <div class="player-details">
                            <span class="player-name">${loser.name}</span>
                            <span class="player-rank">${loser.rank ? `Rank #${loser.rank}` : 'Unranked'}</span>
                        </div>
                        <div class="player-avatar">
                            ${getPlayerInitials(loser.name)}
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

// Filter functionality
function initializeResultsFilters() {
    const playerSearch = document.getElementById('playerSearch');
    const timeFilter = document.getElementById('timeFilter');
    const matchTypeFilter = document.getElementById('matchTypeFilter');
    
    if (playerSearch) {
        playerSearch.addEventListener('input', function(e) {
            applyFilters();
        });
    }
    
    if (timeFilter) {
        timeFilter.addEventListener('change', function(e) {
            applyFilters();
        });
    }
    
    if (matchTypeFilter) {
        matchTypeFilter.addEventListener('change', function(e) {
            applyFilters();
        });
    }
}

// Apply all filters
function applyFilters() {
    const playerSearch = document.getElementById('playerSearch')?.value.toLowerCase() || '';
    const timeFilter = document.getElementById('timeFilter')?.value || 'all';
    const matchTypeFilter = document.getElementById('matchTypeFilter')?.value || 'all';
    
    displayedMatches = allMatches.filter(match => {
        // Player name filter
        if (playerSearch.trim() !== '') {
            const hasPlayer = match.player1.name.toLowerCase().includes(playerSearch) || 
                            match.player2.name.toLowerCase().includes(playerSearch);
            if (!hasPlayer) return false;
        }
        
        // Time filter
        if (timeFilter !== 'all') {
            const matchDate = new Date(match.completedDate);
            const now = new Date();
            const daysDiff = Math.ceil((now - matchDate) / (1000 * 60 * 60 * 24));
            
            switch(timeFilter) {
                case 'week':
                    if (daysDiff > 7) return false;
                    break;
                case 'month':
                    if (daysDiff > 30) return false;
                    break;
                case 'season':
                    // All matches this season (for now, all matches)
                    break;
            }
        }
        
        // Match type filter (for now, all matches are regular season)
        if (matchTypeFilter === 'championship' || matchTypeFilter === 'exhibition') {
            return false; // No championship or exhibition matches yet
        }
        
        return true;
    });
    
    renderMatches(displayedMatches);
    updateMatchCount();
}

// Update match count display
function updateMatchCount() {
    const paginationInfo = document.querySelector('.pagination-info');
    if (paginationInfo) {
        const total = allMatches.length;
        const displayed = displayedMatches.length;
        
        if (displayed === total) {
            paginationInfo.textContent = `Showing all ${total} matches`;
        } else {
            paginationInfo.textContent = `Showing ${displayed} of ${total} matches`;
        }
    }
}

// Player stats modal (simplified for real data)
function showPlayerStatsModal(playerName) {
    const adminData = loadAdminData();
    const player = adminData.players.find(p => p.name === playerName);
    
    if (!player) {
        alert(`Player "${playerName}" not found.`);
        return;
    }
    
    const playerMatches = allMatches.filter(match => 
        match.player1.name === playerName || match.player2.name === playerName
    );
    
    const wins = playerMatches.filter(match => match.winner.name === playerName).length;
    const losses = playerMatches.length - wins;
    
    alert(`Player Stats for ${playerName}\n\nRank: #${player.rank}\nWins: ${wins}\nLosses: ${losses}\nPoints: ${player.points}\nTotal Matches: ${playerMatches.length}`);
}

// Click handlers for player names
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('player-name')) {
        const playerName = e.target.textContent;
        showPlayerStatsModal(playerName);
    }
});

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

// Add custom styles for real match data
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeOut {
        to { opacity: 0; transform: translateX(100%); }
    }
    
    .upset-winner {
        background: linear-gradient(135deg, var(--amber-warning) 0%, #cc8800 100%) !important;
        border-color: var(--amber-warning) !important;
        box-shadow: 0 0 20px var(--amber-warning) !important;
    }
    
    .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        color: var(--chrome-silver);
        font-size: 1.1rem;
        opacity: 0.7;
        background: var(--deep-charcoal);
        border-radius: 8px;
        border: 1px solid rgba(192, 192, 192, 0.2);
    }
    
    .player-name:hover {
        color: var(--electric-cyan) !important;
        cursor: pointer;
        text-decoration: underline;
    }
    
    .result-card.upset {
        border-color: var(--amber-warning);
    }
    
    .result-card.upset:hover {
        box-shadow: 0 8px 32px rgba(255, 193, 7, 0.3);
    }
`;
document.head.appendChild(style);

// Auto-refresh matches every 30 seconds to pick up new results
setInterval(() => {
    const newAdminData = loadAdminData();
    const newMatches = getCompletedMatches(newAdminData);
    
    if (newMatches.length !== allMatches.length) {
        allMatches = newMatches;
        applyFilters(); // Re-apply current filters with new data
        showNotification('New match results available!', 'success');
    }
}, 30000);