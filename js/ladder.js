// Ladder Page JavaScript - Loads data from JSON files

document.addEventListener('DOMContentLoaded', async function() {
    await loadAndDisplayLadder();
    initializeFilters();
    startAutoRefresh();
    console.log('Ladder page initialized with data and auto-refresh');
});

// Global variables
let allPlayers = [];
let displayedPlayers = [];

// Load data from JSON files
async function loadAdminData() {
    try {
        const timestamp = Date.now();
        const [playersRes, matchesRes] = await Promise.all([
            fetch(`/data/players.json?v=${timestamp}`),
            fetch(`/data/matches.json?v=${timestamp}`)
        ]);

        const players = await playersRes.json();
        const matches = await matchesRes.json();

        return { players: players || [], matches: matches || [] };
    } catch (error) {
        console.error('Error loading data from JSON files:', error);
        return { players: [], matches: [] };
    }
}

// Load and display ladder data
async function loadAndDisplayLadder() {
    console.log('🔄 Refreshing ladder data...');
    try {
        const adminData = await loadAdminData();
        const previousCount = allPlayers.length;

        allPlayers = adminData.players
            .filter(player => player.rank != null && player.rank !== undefined) // Only players with ranks
            .sort((a, b) => a.rank - b.rank) // Sort by rank
            .map(player => ({
                ...player,
                winRate: calculateWinRate(player.wins || 0, player.losses || 0),
                totalGames: (player.wins || 0) + (player.losses || 0),
                status: player.status || 'active',
                tier: getTier(player.rank)
            }));

        displayedPlayers = [...allPlayers];
        renderLadderTable();

        if (previousCount !== allPlayers.length) {
            console.log(`✅ Ladder updated: ${allPlayers.length} players (was ${previousCount})`);
        }

        // Update last refresh time
        updateLastRefreshTime();

    } catch (error) {
        console.error('❌ Error refreshing ladder data:', error);
    }
}

// Start automatic refresh every 30 seconds
function startAutoRefresh() {
    // Refresh every 30 seconds
    setInterval(async () => {
        await loadAndDisplayLadder();
    }, 30000);

    console.log('🔄 Auto-refresh started (every 30 seconds)');
}

// Manual refresh function
async function refreshLadder() {
    console.log('🔄 Manual ladder refresh triggered');
    await loadAndDisplayLadder();

    // Show brief notification
    const notification = document.createElement('div');
    notification.textContent = '✅ Ladder refreshed!';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--neon-green);
        color: var(--obsidian-black);
        padding: 0.5rem 1rem;
        border-radius: 4px;
        z-index: 9999;
        font-weight: 600;
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            document.body.removeChild(notification);
        }
    }, 2000);
}

// Update last refresh time display
function updateLastRefreshTime() {
    const timeElement = document.getElementById('lastRefreshTime');
    if (timeElement) {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString();
    }
}

// Calculate win rate percentage
function calculateWinRate(wins, losses) {
    const totalGames = wins + losses;
    if (totalGames === 0) return 0;
    return Math.round((wins / totalGames) * 100);
}

// Get tier based on rank
function getTier(rank) {
    if (rank <= 3) return 'champion';
    if (rank <= 6) return 'contender';
    if (rank <= 10) return 'challenger';
    return 'regular';
}

// Render ladder table
function renderLadderTable() {
    const tableBody = document.getElementById('ladderTableBody');
    if (!tableBody) return;
    
    if (displayedPlayers.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="3" class="empty-table">
                    <p>No players found. Players will appear here when added through the admin panel.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    const playersHTML = displayedPlayers.map(player => createPlayerRow(player)).join('');
    tableBody.innerHTML = playersHTML;
}

// Create player row HTML
function createPlayerRow(player) {
    const statusClass = player.status || 'active';
    const tierClass = player.tier;
    const lastActiveDate = player.lastActive ? new Date(player.lastActive).toLocaleDateString() : 'Never';
    const trend = getTrend(player);
    
    return `
        <tr class="player-row ${tierClass}" data-player-id="${player.id}">
            <td class="rank-cell">
                <div class="rank-container">
                    <span class="rank-number">${player.rank}</span>
                    ${trend ? `<span class="trend-indicator ${trend}">${getTrendIcon(trend)}</span>` : ''}
                </div>
            </td>
            <td class="player-cell">
                <div class="player-info">
                    <div class="player-details">
                        <div class="player-name">${player.name}</div>
                    </div>
                </div>
            </td>
            <td class="record-cell">
                <div class="record-stats">
                    <span class="wins">${player.wins || 0}W</span>
                    <span class="losses">${player.losses || 0}L</span>
                </div>
            </td>
        </tr>
    `;
}

// Get player initials for avatar
function getPlayerInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

// Get tier icon
function getTierIcon(tier) {
    switch (tier) {
        case 'champion': return '👑';
        case 'contender': return '🥈';
        case 'challenger': return '🥉';
        default: return '🎱';
    }
}

// Get trend (simplified - could be enhanced with historical data)
function getTrend(player) {
    const winRate = player.winRate;
    const totalGames = player.totalGames;
    
    if (totalGames < 3) return null; // Not enough data
    
    if (winRate >= 70) return 'hot';
    if (winRate <= 30) return 'cold';
    if (player.rank <= 5) return 'rising';
    
    return null;
}

// Get trend icon
function getTrendIcon(trend) {
    switch (trend) {
        case 'hot': return '🔥';
        case 'cold': return '❄️';
        case 'rising': return '⬆️';
        case 'falling': return '⬇️';
        default: return '';
    }
}

// Get status text
function getStatusText(status) {
    switch (status) {
        case 'active': return 'Active';
        case 'inactive': return 'Inactive';
        case 'suspended': return 'Suspended';
        default: return 'Active';
    }
}

// Initialize filters
function initializeFilters() {
    const playerSearch = document.getElementById('playerSearch');
    const statusFilter = document.getElementById('statusFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    if (playerSearch) {
        playerSearch.addEventListener('input', applyFilters);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', applySorting);
    }
}

// Apply filters
function applyFilters() {
    const playerSearch = document.getElementById('playerSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    
    displayedPlayers = allPlayers.filter(player => {
        // Player name filter
        if (playerSearch.trim() !== '') {
            if (!player.name.toLowerCase().includes(playerSearch)) {
                return false;
            }
        }
        
        // Status filter
        if (statusFilter !== 'all') {
            const playerStatus = player.status || 'active';
            if (playerStatus !== statusFilter) {
                return false;
            }
        }
        
        return true;
    });
    
    renderLadderTable();
}

// Apply sorting
function applySorting() {
    const sortFilter = document.getElementById('sortFilter')?.value || 'rank';
    
    displayedPlayers.sort((a, b) => {
        switch (sortFilter) {
            case 'rank':
                return a.rank - b.rank;
            case 'wins':
                return (b.wins || 0) - (a.wins || 0);
            case 'winrate':
                return b.winRate - a.winRate;
            default:
                return a.rank - b.rank;
        }
    });
    
    renderLadderTable();
}
