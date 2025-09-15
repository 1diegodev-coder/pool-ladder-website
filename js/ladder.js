// Ladder Page JavaScript - Loads data directly from admin system

document.addEventListener('DOMContentLoaded', async function() {
    // Wait for Supabase to be available, then initialize
    if (window.waitForSupabase) {
        waitForSupabase(async () => {
            await loadAndDisplayLadder();
            initializeFilters();
            ();
            console.log('Ladder page initialized with admin data');
        });
    } else {
        // Fallback if waitForSupabase is not available
        setTimeout(async () => {
            await loadAndDisplayLadder();
            initializeFilters();
            ();
            console.log('Ladder page initialized with admin data');
        }, 1000);
    }
});

// Global variables
let allPlayers = [];
let displayedPlayers = [];

// Load admin data from database or localStorage
async function loadAdminData() {
    if (window.poolDB) {
        try {
            const players = await poolDB.getAllPlayers();
            const matches = await poolDB.getAllMatches();
            return { players: players || [], matches: matches || [] };
        } catch (error) {
            console.error('Error loading from database, falling back to localStorage:', error);
        }
    }
    
    // Fallback to localStorage
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

// Load and display ladder data
async function loadAndDisplayLadder() {
    const adminData = await loadAdminData();
    allPlayers = adminData.players
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
                    <span class="rank-badge ${tierClass}">${getTierIcon(player.tier)}</span>
                    ${trend ? `<span class="trend-indicator ${trend}">${getTrendIcon(trend)}</span>` : ''}
                </div>
            </td>
            <td class="player-cell">
                <div class="player-info">
                    <div class="player-avatar">
                        ${getPlayerInitials(player.name)}
                    </div>
                    <div class="player-details">
                        <div class="player-name">${player.name}</div>
                        <div class="player-meta">
                            <span class="last-active">Last active: ${lastActiveDate}</span>
                        </div>
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

