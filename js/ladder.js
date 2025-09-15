// Ladder Page JavaScript - Loads data directly from admin system

document.addEventListener('DOMContentLoaded', async function() {
    // Wait for Supabase to be available, then initialize
    if (window.waitForSupabase) {
        waitForSupabase(async () => {
            await loadAndDisplayLadder();
            initializeFilters();
            initializeChart();
            console.log('Ladder page initialized with admin data');
        });
    } else {
        // Fallback if waitForSupabase is not available
        setTimeout(async () => {
            await loadAndDisplayLadder();
            initializeFilters();
            initializeChart();
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
    updateWinRateChart();
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
                <td colspan="5" class="empty-table">
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
            <td class="winrate-cell">
                <div class="winrate-container">
                    <span class="winrate-value">${player.winRate}%</span>
                    <div class="winrate-bar">
                        <div class="winrate-fill" style="width: ${player.winRate}%"></div>
                    </div>
                </div>
            </td>
            <td class="status-cell">
                <span class="status-badge ${statusClass}">${getStatusText(player.status)}</span>
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

// Initialize and update points chart
function initializeChart() {
    updateWinRateChart();
}

function updateWinRateChart() {
    const chartContainer = document.querySelector('.chart-container');
    if (!chartContainer || allPlayers.length === 0) {
        chartContainer.innerHTML = `
            <div class="empty-chart">
                <p>Win rate distribution chart will appear here once players have been added and matches have been played.</p>
            </div>
        `;
        return;
    }
    
    // Create simple bar chart for win rate distribution
    const maxWinRate = Math.max(...allPlayers.map(p => p.winRate || 0));
    const minWinRate = Math.min(...allPlayers.map(p => p.winRate || 0));
    
    const barsHTML = allPlayers.map(player => {
        const height = Math.max(10, (player.winRate || 0));
        const tierClass = player.tier;
        
        return `
            <div class="chart-bar ${tierClass}" style="height: ${height}%;" title="${player.name}: ${player.winRate}% win rate">
                <div class="bar-label">${player.name.split(' ')[0]}</div>
            </div>
        `;
    }).join('');
    
    chartContainer.innerHTML = `
        <div class="chart-bars">
            ${barsHTML}
        </div>
        <div class="chart-legend">
            <div class="legend-item">
                <span class="legend-label">Win Rate Range:</span>
                <span class="legend-value">${minWinRate}% - ${maxWinRate}%</span>
            </div>
        </div>
    `;
}

// Player stats modal
function showPlayerStatsModal(playerName) {
    const adminData = loadAdminData();
    const player = adminData.players.find(p => p.name === playerName);
    
    if (!player) {
        alert(`Player "${playerName}" not found.`);
        return;
    }
    
    // Get player's match history
    const playerMatches = adminData.matches.filter(match => 
        (match.player1.name === playerName || match.player2.name === playerName) &&
        match.status === 'completed'
    );
    
    const wins = playerMatches.filter(match => match.winner.name === playerName).length;
    const losses = playerMatches.length - wins;
    const winRate = calculateWinRate(wins, losses);
    
    // Recent matches
    const recentMatches = playerMatches
        .sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate))
        .slice(0, 5);
    
    const recentResults = recentMatches.map(match => {
        const isWinner = match.winner.name === playerName;
        const opponent = match.player1.name === playerName ? match.player2.name : match.player1.name;
        const score = isWinner 
            ? `${match.winner.id === match.player1.id ? match.player1Score : match.player2Score}-${match.winner.id === match.player1.id ? match.player2Score : match.player1Score}`
            : `${match.winner.id === match.player1.id ? match.player2Score : match.player1Score}-${match.winner.id === match.player1.id ? match.player1Score : match.player2Score}`;
        
        return `${isWinner ? 'W' : 'L'} vs ${opponent} (${score})`;
    }).join('\n');
    
    const statsText = `Player Stats for ${playerName}

Rank: #${player.rank}
Record: ${wins}W - ${losses}L
Win Rate: ${winRate}%
Total Matches: ${playerMatches.length}
Status: ${getStatusText(player.status)}

Recent Results:
${recentResults || 'No recent matches'}`;
    
    alert(statsText);
}

// Click handlers
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('player-name')) {
        const playerName = e.target.textContent;
        showPlayerStatsModal(playerName);
    }
});

// Auto-refresh ladder every 30 seconds to pick up changes from admin
setInterval(async () => {
    try {
        const newAdminData = await loadAdminData();
        if (newAdminData && newAdminData.players && Array.isArray(newAdminData.players)) {
            const newPlayersCount = newAdminData.players.length;
            const currentPlayersCount = allPlayers.length;
            
            if (newPlayersCount !== currentPlayersCount) {
                loadAndDisplayLadder();
                showNotification('Ladder updated!', 'success');
            }
        }
    } catch (error) {
        console.error('Error in auto-refresh:', error);
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
    
    .player-row.champion {
        background: linear-gradient(90deg, rgba(255, 215, 0, 0.1) 0%, transparent 100%);
        border-left: 4px solid var(--gold-accent);
    }
    
    .player-row.contender {
        background: linear-gradient(90deg, rgba(192, 192, 192, 0.1) 0%, transparent 100%);
        border-left: 4px solid #c0c0c0;
    }
    
    .player-row.challenger {
        background: linear-gradient(90deg, rgba(205, 127, 50, 0.1) 0%, transparent 100%);
        border-left: 4px solid #cd7f32;
    }
    
    .rank-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .rank-number {
        font-weight: bold;
        font-size: 1.2rem;
        color: var(--electric-cyan);
    }
    
    .rank-badge {
        font-size: 1.1rem;
    }
    
    .trend-indicator {
        font-size: 0.9rem;
    }
    
    .trend-indicator.hot {
        animation: pulse 2s infinite;
    }
    
    .player-info {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .player-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--electric-cyan) 0%, #0099cc 100%);
        color: var(--obsidian-black);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 1rem;
        border: 2px solid var(--chrome-silver);
    }
    
    .player-details {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .player-name {
        font-weight: 600;
        font-size: 1.1rem;
        color: var(--chrome-silver);
        cursor: pointer;
        transition: color 0.3s ease;
    }
    
    .player-name:hover {
        color: var(--electric-cyan);
        text-decoration: underline;
    }
    
    .player-meta {
        font-size: 0.8rem;
        color: var(--chrome-silver);
        opacity: 0.7;
    }
    
    .record-stats {
        display: flex;
        gap: 0.5rem;
    }
    
    .wins {
        color: var(--neon-green);
        font-weight: 600;
    }
    
    .losses {
        color: var(--crimson-red);
        font-weight: 600;
    }
    
    .points-container,
    .winrate-container {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        align-items: center;
    }
    
    .points-value,
    .winrate-value {
        font-weight: bold;
        color: var(--electric-cyan);
    }
    
    .points-bar,
    .winrate-bar {
        width: 60px;
        height: 6px;
        background: var(--deep-charcoal);
        border-radius: 3px;
        overflow: hidden;
    }
    
    .points-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--electric-cyan) 0%, var(--neon-green) 100%);
        border-radius: 3px;
        transition: width 0.3s ease;
    }
    
    .winrate-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--crimson-red) 0%, var(--neon-green) 100%);
        border-radius: 3px;
        transition: width 0.3s ease;
    }
    
    .status-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .status-badge.active {
        background: var(--neon-green);
        color: var(--obsidian-black);
    }
    
    .status-badge.inactive {
        background: var(--chrome-silver);
        color: var(--obsidian-black);
    }
    
    .status-badge.suspended {
        background: var(--crimson-red);
        color: white;
    }
    
    .chart-bars {
        display: flex;
        align-items: flex-end;
        justify-content: space-around;
        height: 200px;
        padding: 1rem;
        background: var(--deep-charcoal);
        border-radius: 8px;
        margin-bottom: 1rem;
    }
    
    .chart-bar {
        width: 40px;
        background: var(--electric-cyan);
        border-radius: 4px 4px 0 0;
        position: relative;
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .chart-bar.champion {
        background: linear-gradient(to top, var(--gold-accent) 0%, #ffd700 100%);
    }
    
    .chart-bar.contender {
        background: linear-gradient(to top, #c0c0c0 0%, #e0e0e0 100%);
    }
    
    .chart-bar.challenger {
        background: linear-gradient(to top, #cd7f32 0%, #daa520 100%);
    }
    
    .chart-bar:hover {
        transform: scaleX(1.1);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
    
    .bar-label {
        position: absolute;
        bottom: -25px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 0.8rem;
        color: var(--chrome-silver);
        white-space: nowrap;
        width: 60px;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .chart-legend {
        display: flex;
        justify-content: center;
        gap: 2rem;
        padding: 1rem;
        background: var(--obsidian-black);
        border-radius: 8px;
    }
    
    .legend-item {
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }
    
    .legend-label {
        color: var(--electric-cyan);
        font-weight: 600;
    }
    
    .legend-value {
        color: var(--chrome-silver);
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
`;
document.head.appendChild(style);