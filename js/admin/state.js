/**
 * Admin Panel State Management
 * Handles global data storage and persistence
 */

// Global admin data store
export let adminData = {
    players: [],
    matches: [],
    config: {}
};

/**
 * Update the global admin data
 * @param {Object} newData - New admin data to merge
 */
export function setAdminData(newData) {
    adminData = { ...adminData, ...newData };
}

/**
 * Normalize player record from various API formats
 * @param {Object} player - Raw player data
 * @returns {Object|null} Normalized player object
 */
export function normalizePlayerRecord(player) {
    if (!player) return null;

    return {
        id: Number(player.id),
        name: player.name,
        rank: Number.isFinite(player.rank) ? player.rank : parseInt(player.rank || '0', 10) || 0,
        wins: Number.isFinite(player.wins) ? player.wins : parseInt(player.wins || '0', 10) || 0,
        losses: Number.isFinite(player.losses) ? player.losses : parseInt(player.losses || '0', 10) || 0,
        status: player.status || 'active',
        createdAt: player.createdAt || player.created_at || player.created || null,
        lastActive: player.lastActive || player.last_active || null
    };
}

/**
 * Normalize match record from various API formats
 * @param {Object} match - Raw match data
 * @returns {Object|null} Normalized match object
 */
export function normalizeMatchRecord(match) {
    if (!match) return null;

    const player1Id = Number(match.player1?.id ?? match.player1_id ?? match.player1Id ?? 0) || null;
    const player2Id = Number(match.player2?.id ?? match.player2_id ?? match.player2Id ?? 0) || null;

    const player1Name = match.player1?.name ?? match.player1_name ?? 'Player 1';
    const player2Name = match.player2?.name ?? match.player2_name ?? 'Player 2';

    const player1Score = normalizeScore(match.player1Score ?? match.player1_score);
    const player2Score = normalizeScore(match.player2Score ?? match.player2_score);

    const winnerId = match.winnerId ?? match.winner_id ?? null;
    const loserId = match.loserId ?? match.loser_id ?? null;

    const normalized = {
        id: Number(match.id),
        status: match.status || 'scheduled',
        date: match.date || match.match_date || '',
        time: match.time || match.match_time || '00:00:00',
        player1: {
            id: player1Id,
            name: player1Name
        },
        player2: {
            id: player2Id,
            name: player2Name
        },
        player1Score,
        player2Score,
        winnerId: winnerId != null ? Number(winnerId) : null,
        winnerName: match.winnerName || match.winner_name || (winnerId === player1Id ? player1Name : winnerId === player2Id ? player2Name : null),
        loserId: loserId != null ? Number(loserId) : null,
        loserName: match.loserName || match.loser_name || (loserId === player1Id ? player1Name : loserId === player2Id ? player2Name : null),
        createdAt: match.createdAt || match.created_at || match.created || null,
        completedAt: match.completedAt || match.completed_at || match.completedDate || null
    };

    return normalized;
}

/**
 * Normalize score value
 * @param {*} value - Score value to normalize
 * @returns {number|null} Normalized score or null
 */
function normalizeScore(value) {
    if (value === undefined || value === null || value === '') {
        return null;
    }
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Save admin data to localStorage
 */
export function saveAdminData() {
    try {
        localStorage.setItem('poolLadderAdminData', JSON.stringify(adminData));
        console.log('💾 Admin data saved to localStorage');
    } catch (error) {
        console.error('❌ Error saving admin data:', error);
        alert('Error saving data. Please try again.');
    }
}

/**
 * Load admin data from server or localStorage
 * @param {boolean} forceRefresh - Force reload from server
 * @returns {Promise<Object>} Admin data
 */
export async function loadAdminData(forceRefresh = false) {
    console.log('📋 Loading admin data...' + (forceRefresh ? ' (Force refresh from server)' : ''));

    const applyNormalization = data => {
        return {
            players: Array.isArray(data.players) ? data.players.map(normalizePlayerRecord).filter(Boolean) : [],
            matches: Array.isArray(data.matches) ? data.matches.map(normalizeMatchRecord).filter(Boolean) : [],
            config: data.config || {}
        };
    };

    // If not forcing refresh, try localStorage first
    if (!forceRefresh) {
        const savedData = localStorage.getItem('poolLadderAdminData');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                adminData = applyNormalization(parsed);
                console.log('✅ Loaded data from localStorage');
                return adminData;
            } catch (error) {
                console.error('❌ Error parsing localStorage data:', error);
            }
        }
    }

    // Load from server (JSON files)
    try {
        const timestamp = Date.now();
        const [playersRes, matchesRes, metaRes] = await Promise.all([
            fetch(`/data/players.json?v=${timestamp}`),
            fetch(`/data/matches.json?v=${timestamp}`),
            fetch(`/data/meta.json?v=${timestamp}`).catch(() => ({ ok: false }))
        ]);

        const playersData = playersRes.ok ? await playersRes.json() : [];
        const matchesData = matchesRes.ok ? await matchesRes.json() : [];
        const metaData = metaRes.ok ? await metaRes.json() : {};

        adminData = applyNormalization({
            players: playersData,
            matches: matchesData,
            config: metaData
        });

        // Save to localStorage for future offline access
        saveAdminData();

        console.log('✅ Loaded data from server');
        return adminData;
    } catch (error) {
        console.error('❌ Error loading data from server:', error);
        
        // Fallback to localStorage if server fails
        const savedData = localStorage.getItem('poolLadderAdminData');
        if (savedData) {
            try {
                adminData = applyNormalization(JSON.parse(savedData));
                console.log('⚠️ Using localStorage fallback due to server error');
                return adminData;
            } catch (parseError) {
                console.error('❌ Error parsing localStorage fallback:', parseError);
            }
        }

        // Last resort: empty data
        adminData = { players: [], matches: [], config: {} };
        return adminData;
    }
}
