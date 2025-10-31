// Simplified Admin Panel JavaScript

// Import HTML escaping utility for XSS protection
import { escapeHTML } from './utils/escapeHTML.js';

// Global data storage
let adminData = {
    players: [],
    matches: [],
    config: {}
};

function normalizePlayerRecord(player) {
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

function normalizeMatchRecord(match) {
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

function normalizeScore(value) {
    if (value === undefined || value === null || value === '') {
        return null;
    }
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
}

// Load data on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Admin panel initializing...');
    initializeAdminPanel();
});

// Initialize admin panel
async function initializeAdminPanel() {
    await loadAdminData();
    initializeAdminTabs();
    initializeFormHandlers();
    await renderPlayersTable();
    await renderScheduledMatches();
    await renderRecentResults();
    await renderLadderTable();
    await updateDashboardStats();

    console.log('✅ Admin panel initialized');
}

// Initialize form handlers for Enter key support
function initializeFormHandlers() {
    // Form handlers are now managed by HTML onsubmit attributes
    console.log('Form handlers initialized');
}

// Edit Match Modal Functions
function editMatch(matchId) {
    const match = adminData.matches.find(m => m.id === matchId);
    if (!match) {
        alert('Match not found.');
        return;
    }
    
    const modal = document.getElementById('editMatchModal');
    const form = document.getElementById('editMatchForm');
    
    if (!modal || !form) return;
    
    // Populate player dropdowns
    populateEditPlayerDropdowns();
    
    const player1Id = match.player1?.id ?? '';
    const player2Id = match.player2?.id ?? '';
    const matchDate = match.date || '';
    const player1Score = match.player1Score ?? '';
    const player2Score = match.player2Score ?? '';
    const player1Name = match.player1?.name || 'Player 1';
    const player2Name = match.player2?.name || 'Player 2';
    
    // Fill form with current match data
    form.querySelector('select[name="player1"]').value = player1Id;
    form.querySelector('select[name="player2"]').value = player2Id;

    // Format date for HTML date input (YYYY-MM-DD format)
    const formattedDate = matchDate ? new Date(matchDate).toISOString().split('T')[0] : '';
    form.querySelector('input[name="matchDate"]').value = formattedDate;

    form.querySelector('input[name="matchId"]').value = matchId;
    form.querySelector('input[name="matchStatus"]').value = match.status;
    
    // Show scores section if match is completed
    const scoreSection = document.getElementById('scoreSection');
    const player1ScoreInput = form.querySelector('input[name="player1Score"]');
    const player2ScoreInput = form.querySelector('input[name="player2Score"]');
    const player1ScoreLabel = document.getElementById('player1ScoreLabel');
    const player2ScoreLabel = document.getElementById('player2ScoreLabel');
    
    if (match.status === 'completed') {
        scoreSection.style.display = 'block';
        player1ScoreInput.value = player1Score;
        player2ScoreInput.value = player2Score;
        player1ScoreLabel.textContent = `${player1Name} Score`;
        player2ScoreLabel.textContent = `${player2Name} Score`;
    } else {
        scoreSection.style.display = 'none';
        player1ScoreInput.value = '';
        player2ScoreInput.value = '';
    }
    
    modal.style.display = 'flex';
}

function closeEditMatchModal() {
    const modal = document.getElementById('editMatchModal');
    if (modal) {
        modal.style.display = 'none';
        const form = document.getElementById('editMatchForm');
        if (form) form.reset();
    }
}

function populateEditPlayerDropdowns() {
    const player1Select = document.querySelector('#editMatchModal select[name="player1"]');
    const player2Select = document.querySelector('#editMatchModal select[name="player2"]');
    
    if (!player1Select || !player2Select) return;
    
    // Clear existing options except first
    player1Select.innerHTML = '<option value="">Select Player 1</option>';
    player2Select.innerHTML = '<option value="">Select Player 2</option>';
    
    // Add player options (using Option constructor for safe escaping)
    adminData.players.forEach(player => {
        const option1 = new Option(escapeHTML(player.name), player.id);
        const option2 = new Option(escapeHTML(player.name), player.id);
        player1Select.add(option1);
        player2Select.add(option2);
    });
}

async function saveMatchEdit() {
    const form = document.getElementById('editMatchForm');
    const formData = new FormData(form);
    
    const matchId = parseInt(formData.get('matchId'));
    const player1Id = parseInt(formData.get('player1'));
    const player2Id = parseInt(formData.get('player2'));
    const matchDate = formData.get('matchDate');
    const matchStatus = formData.get('matchStatus');
    const player1ScoreValue = formData.get('player1Score');
    const player2ScoreValue = formData.get('player2Score');

    // Validation
    if (!player1Id || !player2Id || !matchDate) {
        alert('Please fill in all required fields.');
        return;
    }
    
    if (player1Id === player2Id) {
        alert('Please select different players for the match.');
        return;
    }
    
    const player1 = adminData.players.find(p => p.id === player1Id);
    const player2 = adminData.players.find(p => p.id === player2Id);
    
    if (!player1 || !player2) {
        alert('Selected players not found.');
        return;
    }
    
    try {
        let score1 = null;
        let score2 = null;
        let winnerId = null;
        let winnerName = null;
        let loserId = null;
        let loserName = null;
        
        if (matchStatus === 'completed' && player1ScoreValue && player2ScoreValue) {
            score1 = parseInt(player1ScoreValue, 10);
            score2 = parseInt(player2ScoreValue, 10);
            
            if (isNaN(score1) || isNaN(score2) || score1 < 0 || score2 < 0) {
                alert('Please enter valid scores (numbers 0 or higher).');
                return;
            }
            
            if (score1 === score2) {
                alert('Match cannot end in a tie. Please enter different scores.');
                return;
            }
            
            // Determine winner
            winnerId = score1 > score2 ? player1Id : player2Id;
            winnerName = score1 > score2 ? player1.name : player2.name;
            loserId = score1 > score2 ? player2Id : player1Id;
            loserName = score1 > score2 ? player2.name : player1.name;
        }
        
        const match = adminData.matches.find(m => m.id === matchId);
        if (match) {
            Object.assign(match, {
                player1: { id: player1Id, name: player1.name },
                player2: { id: player2Id, name: player2.name },
                date: matchDate,
                status: matchStatus,
                time: match.time || '00:00:00',
                player1Score: matchStatus === 'completed' ? score1 : null,
                player2Score: matchStatus === 'completed' ? score2 : null,
                winnerId: matchStatus === 'completed' ? winnerId : null,
                winnerName: matchStatus === 'completed' ? winnerName : null,
                loserId: matchStatus === 'completed' ? loserId : null,
                loserName: matchStatus === 'completed' ? loserName : null,
                completedAt: matchStatus === 'completed' ? new Date().toISOString() : null
            });
            saveAdminData();
        }
        
        // Refresh data and update display
        await loadAdminData();
        await renderScheduledMatches();
        await renderRecentResults();
        await updateDashboardStats();
        
        // Close modal
        closeEditMatchModal();
        
        alert('Match updated successfully!');
    } catch (error) {
        console.error('Error updating match:', error);
        alert('Error updating match. Please try again.');
    }
}

// Data persistence
async function loadAdminData(forceRefresh = false) {
    console.log('📋 Loading admin data...' + (forceRefresh ? ' (Force refresh from server)' : ''));

    const applyNormalization = data => {
        return {
            players: Array.isArray(data.players) ? data.players.map(normalizePlayerRecord).filter(Boolean) : [],
            matches: Array.isArray(data.matches) ? data.matches.map(normalizeMatchRecord).filter(Boolean) : [],
            config: data.config || {}
        };
    };

    // If forceRefresh is true, skip localStorage and fetch fresh data from server
    if (!forceRefresh) {
        // Try loading from localStorage first (for admin changes not yet published)
        const savedData = localStorage.getItem('poolLadderAdminData');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                adminData = applyNormalization(parsed);
                console.log('✅ Loaded data from localStorage:', {
                    players: adminData.players.length,
                    matches: adminData.matches.length
                });
                saveAdminData();
                return;
            } catch (error) {
                console.error('Error loading from localStorage:', error);
            }
        }
    } else {
        console.log('🔄 Forcing refresh - clearing localStorage cache');
        localStorage.removeItem('poolLadderAdminData');
    }

    // If no localStorage data or forceRefresh, fetch from JSON files
    try {
        const timestamp = Date.now();
        const [playersRes, matchesRes] = await Promise.all([
            fetch(`/data/players.json?v=${timestamp}`),
            fetch(`/data/matches.json?v=${timestamp}`)
        ]);

        if (playersRes.ok && matchesRes.ok) {
            const [playersData, matchesData] = await Promise.all([
                playersRes.json(),
                matchesRes.json()
            ]);

            adminData = applyNormalization({
                players: playersData,
                matches: matchesData,
                config: {}
            });

            console.log('✅ Loaded data from JSON files:', {
                players: adminData.players.length,
                matches: adminData.matches.length
            });
        } else {
            console.warn('⚠️ Could not load JSON files, starting with empty data');
            adminData.players = [];
            adminData.matches = [];
        }
    } catch (error) {
        console.error('❌ Error loading from JSON files:', error);
        adminData.players = [];
        adminData.matches = [];
    }
}

function saveAdminData() {
    try {
        localStorage.setItem('poolLadderAdminData', JSON.stringify(adminData));
    } catch (error) {
        console.error('Error saving admin data:', error);
    }
}

// Tab switching functionality
function initializeAdminTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    const contents = document.querySelectorAll('.admin-content');

    console.log('🔧 Initializing admin tabs:', tabs.length, 'tabs found');
    console.log('🔧 Admin content sections:', contents.length, 'sections found');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            console.log('🔘 Tab clicked:', targetTab);

            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.style.display = 'none');
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            const targetContent = document.getElementById(targetTab + '-tab');
            if (targetContent) {
                targetContent.style.display = 'block';
                console.log('✅ Showing tab:', targetTab);
            } else {
                console.error('❌ Tab content not found:', targetTab + '-tab');
            }
        });
    });
}

// Add Player Modal Functions
function openAddPlayerModal() {
    const modal = document.getElementById('addPlayerModal');
    if (modal) {
        modal.style.display = 'flex';
        const nameInput = modal.querySelector('input[name="playerName"]');
        if (nameInput) {
            nameInput.focus();
        }
    }
}

function closeAddPlayerModal() {
    const modal = document.getElementById('addPlayerModal');
    if (modal) {
        modal.style.display = 'none';
        // Reset form
        const form = document.getElementById('addPlayerForm');
        if (form) form.reset();
    }
}

async function addNewPlayer() {
    const form = document.getElementById('addPlayerForm');
    const nameInput = form.querySelector('input[name="playerName"]');
    const playerName = nameInput.value.trim();
    
    if (!playerName) {
        alert('Please enter a player name.');
        return;
    }
    
    // Check if player already exists
    if (adminData.players.some(player => player.name.toLowerCase() === playerName.toLowerCase())) {
        alert('Player with this name already exists.');
        return;
    }
    
    try {
        console.log('🎯 Starting to add new player:', playerName);
        
        // Add to local data
        const newPlayerData = {
            id: Date.now(),
            name: playerName,
            wins: 0,
            losses: 0,
            status: 'active',
            rank: adminData.players.length + 1,
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString()
        };

        adminData.players.push(newPlayerData);
        saveAdminData();
        
        console.log('✅ Player added successfully, refreshing data...');
        
        await loadAdminData();
        await renderPlayersTable();
        await renderLadderTable();
        await updateDashboardStats();
        
        closeAddPlayerModal();
        
        alert(`Player "${playerName}" added successfully!`);
        console.log('✨ Player addition process completed successfully');
    } catch (error) {
        console.error('❌ Error adding player:', error);
        alert('Error adding player. Please try again.');
    }
}

// Render players list
async function renderPlayersTable() {
    const playersList = document.querySelector('#playersList');
    if (!playersList) return;
    
    if (adminData.players.length === 0) {
        playersList.innerHTML = `
            <div class="no-players">
                <p>No players added yet. Use the "Add New Player" button to add players to the league.</p>
            </div>
        `;
        return;
    }
    
    // Sort players by rank
    const sortedPlayers = adminData.players.sort((a, b) => a.rank - b.rank);
    
    playersList.innerHTML = sortedPlayers.map(player => `
        <div class="player-line" data-player-id="${player.id}">
            <span class="rank-number">#${player.rank}</span>
            <span class="player-name" ondblclick="editPlayerName(${player.id})" title="Double-click to edit">${escapeHTML(player.name)}</span>
            <div class="player-actions">
                <button class="btn btn-sm btn-danger" onclick="removePlayer(${player.id})">Remove</button>
            </div>
        </div>
    `).join('');
}

// Remove player function
async function removePlayer(playerId) {
    if (confirm('Are you sure you want to remove this player?')) {
        try {
            adminData.players = adminData.players.filter(player => player.id !== playerId);
            
            adminData.players.forEach((player, index) => {
                player.rank = index + 1;
            });
            
            saveAdminData();
            
            // Refresh data and update display
            await loadAdminData();
            await renderPlayersTable();
            await updateDashboardStats();
            
            alert('Player removed successfully!');
        } catch (error) {
            console.error('Error removing player:', error);
            alert('Error removing player. Please try again.');
        }
    }
}

// Update dashboard stats
async function updateDashboardStats() {
    const totalPlayersEl = document.querySelector('.admin-stats .quick-stat:nth-child(1) .stat-number');
    const scheduledMatchesEl = document.querySelector('.admin-stats .quick-stat:nth-child(2) .stat-number');
    const completedMatchesEl = document.querySelector('.admin-stats .quick-stat:nth-child(3) .stat-number');
    
    if (totalPlayersEl) totalPlayersEl.textContent = adminData.players.length;
    if (scheduledMatchesEl) scheduledMatchesEl.textContent = '0'; // Not implemented yet
    if (completedMatchesEl) completedMatchesEl.textContent = adminData.matches.length;
}

// Change Password Modal Functions
function openChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    if (modal) {
        modal.style.display = 'flex';
        const currentPasswordInput = modal.querySelector('#currentPassword');
        if (currentPasswordInput) {
            currentPasswordInput.focus();
        }
    }
}

function closeChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    if (modal) {
        modal.style.display = 'none';
        // Reset form
        const form = document.getElementById('changePasswordForm');
        if (form) form.reset();
        hideChangePasswordError();
        hideChangePasswordSuccess();
    }
}

// Change password form handling
document.addEventListener('DOMContentLoaded', function() {
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handleChangePassword);
    }
});

function handleChangePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate current password
    if (currentPassword !== 'poolladder2025') {
        showChangePasswordError('Current password is incorrect.');
        return;
    }
    
    // Validate new password
    if (newPassword.length < 6) {
        showChangePasswordError('New password must be at least 6 characters long.');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showChangePasswordError('New passwords do not match.');
        return;
    }
    
    // Show success (in a real app, this would update the password)
    showChangePasswordSuccess('Password change simulated successfully! (This is a demo - password not actually changed)');
    
    // Reset form after delay
    setTimeout(() => {
        closeChangePasswordModal();
    }, 2000);
}

function showChangePasswordError(message) {
    const errorEl = document.getElementById('changePasswordError');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }
    hideChangePasswordSuccess();
}

function hideChangePasswordError() {
    const errorEl = document.getElementById('changePasswordError');
    if (errorEl) {
        errorEl.style.display = 'none';
    }
}

function showChangePasswordSuccess(message) {
    const successEl = document.getElementById('changePasswordSuccess');
    if (successEl) {
        successEl.textContent = message;
        successEl.style.display = 'block';
    }
    hideChangePasswordError();
}

function hideChangePasswordSuccess() {
    const successEl = document.getElementById('changePasswordSuccess');
    if (successEl) {
        successEl.style.display = 'none';
    }
}

// Logout function
function logout(force = false) {
    if (!force && !confirm('Are you sure you want to logout?')) {
        return;
    }

    try {
        if (typeof clearAdminSession === 'function') {
            clearAdminSession();
        } else {
            localStorage.removeItem('admin_jwt_token');
            localStorage.removeItem('admin_jwt_exp');
            localStorage.removeItem('admin_user');
        }
        localStorage.removeItem('poolLadderAdminData');
    } catch (error) {
        console.error('Error clearing admin session:', error);
    }

    window.location.href = 'login.html';
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Close modals with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const activeModals = document.querySelectorAll('.modal[style*="flex"]');
        activeModals.forEach(modal => {
            modal.style.display = 'none';
        });
    }
});

// Edit player name functionality
function editPlayerName(playerId) {
    const player = adminData.players.find(p => p.id === playerId);
    if (!player) return;
    
    const newName = prompt('Enter new name:', player.name);
    if (newName && newName.trim() && newName.trim() !== player.name) {
        const trimmedName = newName.trim();
        
        // Check if name already exists
        if (adminData.players.some(p => p.id !== playerId && p.name.toLowerCase() === trimmedName.toLowerCase())) {
            alert('A player with this name already exists.');
            return;
        }
        
        player.name = trimmedName;
        saveAdminData();
        renderPlayersTable();
        alert('Player name updated successfully!');
    }
}

// Schedule Match Modal Functions
async function openScheduleMatchModal() {
    console.log('🚀 Opening schedule match modal');

    // Ensure data is loaded
    if (!adminData.players || adminData.players.length === 0) {
        console.log('📋 No players data, attempting to reload...');
        await loadAdminData();
    }

    console.log('👥 Players available:', adminData.players?.length || 0);

    if (!adminData.players || adminData.players.length < 2) {
        alert('You need at least 2 players to schedule a match. Please add more players first.');
        return;
    }

    const modal = document.getElementById('scheduleMatchModal');
    if (!modal) {
        console.error('❌ Schedule match modal not found');
        alert('Error: Modal not found. Please refresh the page and try again.');
        return;
    }

    // Populate player dropdowns
    populatePlayerDropdowns();
    modal.style.display = 'flex';

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = modal.querySelector('input[name="matchDate"]');
    if (dateInput) {
        dateInput.value = today;
    }

    console.log('✅ Schedule match modal opened successfully');
}

function closeScheduleMatchModal() {
    const modal = document.getElementById('scheduleMatchModal');
    if (modal) {
        modal.style.display = 'none';
        const form = document.getElementById('scheduleMatchForm');
        if (form) form.reset();
    }
}

function populatePlayerDropdowns() {
    console.log('🔄 Populating player dropdowns');

    const player1Select = document.querySelector('select[name="player1"]');
    const player2Select = document.querySelector('select[name="player2"]');

    if (!player1Select || !player2Select) {
        console.error('❌ Player dropdown elements not found');
        return;
    }

    console.log('👥 Available players for dropdown:', adminData.players?.length || 0);

    // Clear existing options except first
    player1Select.innerHTML = '<option value="">Select Player 1</option>';
    player2Select.innerHTML = '<option value="">Select Player 2</option>';

    // Check if we have players
    if (!adminData.players || adminData.players.length === 0) {
        console.warn('⚠️ No players available for dropdown');
        player1Select.innerHTML = '<option value="">No players available</option>';
        player2Select.innerHTML = '<option value="">No players available</option>';
        return;
    }

    // Add player options (using Option constructor for safe escaping)
    adminData.players.forEach(player => {
        if (player && player.id && player.name) {
            console.log('➕ Adding player to dropdown:', player.name, player.id);
            const option1 = new Option(escapeHTML(player.name), player.id);
            const option2 = new Option(escapeHTML(player.name), player.id);
            player1Select.add(option1);
            player2Select.add(option2);
        } else {
            console.warn('⚠️ Invalid player data:', player);
        }
    });

    console.log('✅ Player dropdowns populated successfully');
}

async function scheduleMatch() {
    console.log('🎯 Starting scheduleMatch function');

    const form = document.getElementById('scheduleMatchForm');
    if (!form) {
        console.error('❌ Schedule match form not found');
        alert('Error: Form not found. Please refresh the page and try again.');
        return;
    }

    const formData = new FormData(form);

    const player1Value = formData.get('player1');
    const player2Value = formData.get('player2');
    const matchDate = formData.get('matchDate');

    console.log('📝 Form data:', { player1Value, player2Value, matchDate });

    const player1Id = parseInt(player1Value);
    const player2Id = parseInt(player2Value);

    console.log('🔢 Parsed IDs:', { player1Id, player2Id });
    console.log('👥 Available players:', adminData.players?.length || 0);

    // Enhanced validation
    if (!player1Value || !player2Value || !matchDate) {
        console.warn('⚠️ Missing form values');
        alert('Please fill in all required fields.');
        return;
    }

    if (isNaN(player1Id) || isNaN(player2Id)) {
        console.error('❌ Invalid player IDs');
        alert('Error: Invalid player selection. Please select valid players.');
        return;
    }
    
    if (player1Id === player2Id) {
        alert('Please select different players for the match.');
        return;
    }
    
    const player1 = adminData.players.find(p => p.id === player1Id);
    const player2 = adminData.players.find(p => p.id === player2Id);
    
    if (!player1 || !player2) {
        alert('Selected players not found.');
        return;
    }
    
    try {
        const newMatch = {
            id: Date.now(),
            status: 'scheduled',
            date: matchDate,
            time: '00:00:00',
            player1: {
                id: player1.id,
                name: player1.name
            },
            player2: {
                id: player2.id,
                name: player2.name
            },
            player1Score: null,
            player2Score: null,
            winnerId: null,
            winnerName: null,
            loserId: null,
            loserName: null,
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        console.log('💾 Saving match to local storage:', newMatch);

        adminData.matches.push(newMatch);
        saveAdminData();
        console.log('✅ Match saved to local storage successfully');

        // Refresh data and update display
        console.log('🔄 Refreshing display...');
        await loadAdminData();
        await renderScheduledMatches();
        await updateDashboardStats();

        // Close modal
        closeScheduleMatchModal();

        alert(`Match scheduled successfully: ${player1.name} vs ${player2.name} on ${matchDate}`);
        console.log('🎉 Match creation completed successfully');

    } catch (error) {
        console.error('❌ Critical error scheduling match:', error);
        alert(`Error scheduling match: ${error.message}. Please check the console for details and try again.`);
    }
}

async function renderScheduledMatches() {
    const scheduledSection = document.querySelector('.matches-section:first-child .admin-match-cards');
    if (!scheduledSection) return;
    
    const scheduledMatches = adminData.matches.filter(match => match.status === 'scheduled');
    
    if (scheduledMatches.length === 0) {
        scheduledSection.innerHTML = `
            <div class="no-matches-message">
                <p>No matches currently scheduled. Use the "Schedule Match" button above to create new matches.</p>
            </div>
        `;
        return;
    }
    
    scheduledSection.innerHTML = scheduledMatches.map(match => {
        const player1Name = escapeHTML(match.player1?.name || 'Unknown Player');
        const player2Name = escapeHTML(match.player2?.name || 'Unknown Player');
        const matchDate = escapeHTML(match.date || 'TBD');

        return `
            <div class="match-card">
                <div class="match-players">
                    <span class="player">${player1Name}</span>
                    <span class="vs">vs</span>
                    <span class="player">${player2Name}</span>
                </div>
                <div class="match-actions">
                    <button class="btn btn-sm btn-outline" onclick="editMatch(${match.id})">Edit</button>
                    <button class="btn btn-sm btn-outline" onclick="recordMatchResult(${match.id})">Record Result</button>
                    <button class="btn btn-sm btn-danger" onclick="cancelMatch(${match.id})">Cancel</button>
                </div>
            </div>
        `;
    }).join('');
}

function cancelMatch(matchId) {
    if (confirm('Are you sure you want to cancel this match?')) {
        adminData.matches = adminData.matches.filter(match => match.id !== matchId);
        saveAdminData();
        renderScheduledMatches();
        updateDashboardStats();
        alert('Match cancelled successfully!');
    }
}

async function recordMatchResult(matchId) {
    const match = adminData.matches.find(m => m.id === matchId);
    if (!match) return;
    
    const player1Name = match.player1?.name || 'Player 1';
    const player2Name = match.player2?.name || 'Player 2';
    const player1Id = match.player1?.id;
    const player2Id = match.player2?.id;
    
    // Get scores from both players
    const player1Score = prompt(`Enter score for ${player1Name}:`, '0');
    if (player1Score === null) return; // User cancelled
    
    const player2Score = prompt(`Enter score for ${player2Name}:`, '0');
    if (player2Score === null) return; // User cancelled
    
    // Validate scores
    const score1 = parseInt(player1Score);
    const score2 = parseInt(player2Score);
    
    if (isNaN(score1) || isNaN(score2) || score1 < 0 || score2 < 0) {
        alert('Please enter valid scores (numbers 0 or higher).');
        return;
    }
    
    if (score1 === score2) {
        alert('Match cannot end in a tie. Please enter different scores.');
        return;
    }
    
    try {
        // Determine winner and loser
        const winnerId = score1 > score2 ? player1Id : player2Id;
        const winnerName = score1 > score2 ? player1Name : player2Name;
        const loserId = score1 > score2 ? player2Id : player1Id;
        const loserName = score1 > score2 ? player2Name : player1Name;
        
        // Update match record
        match.status = 'completed';
        match.player1Score = score1;
        match.player2Score = score2;
        match.winnerId = winnerId;
        match.winnerName = winnerName;
        match.loserId = loserId;
        match.loserName = loserName;
        match.completedAt = new Date().toISOString();
        saveAdminData();
        
        // Update player stats
        await updatePlayerStats(winnerId, loserId);

        // Refresh data and update display
        await loadAdminData();
        await renderScheduledMatches();
        await renderRecentResults();
        await renderLadderTable();
        await renderPlayersTable();
        await updateDashboardStats();
        
        alert(`Match result recorded:\n${player1Name}: ${score1}\n${player2Name}: ${score2}\n\nWinner: ${winnerName}`);
    } catch (error) {
        console.error('Error recording match result:', error);
        alert('Error recording match result. Please try again.');
    }
}

// Update player statistics after match completion
async function updatePlayerStats(winnerId, loserId) {
    const winner = adminData.players.find(p => p.id === winnerId);
    const loser = adminData.players.find(p => p.id === loserId);
    
    if (winner && loser) {
        try {
            winner.wins = (winner.wins || 0) + 1;
            winner.lastActive = new Date().toISOString();

            loser.losses = (loser.losses || 0) + 1;
            loser.lastActive = new Date().toISOString();

            saveAdminData();
        } catch (error) {
            console.error('Error updating player stats:', error);
            throw error;
        }
    }
}

// Recalculate all player ranks based on wins (most wins first, then by losses)
function recalculateRanks() {
    adminData.players.sort((a, b) => {
        const aWins = a.wins || 0;
        const bWins = b.wins || 0;
        const aLosses = a.losses || 0;
        const bLosses = b.losses || 0;
        
        // First sort by wins (more wins = higher rank)
        if (bWins !== aWins) return bWins - aWins;
        // If wins are equal, sort by losses (fewer losses = higher rank)
        return aLosses - bLosses;
    });
    
    // Assign ranks
    adminData.players.forEach((player, index) => {
        player.rank = index + 1;
    });
}

// Render recent results section
async function renderRecentResults() {
    const recentSection = document.querySelector('.matches-section:last-child .admin-match-cards');
    if (!recentSection) return;
    
    const completedMatches = adminData.matches
        .filter(match => match.status === 'completed')
        .sort((a, b) => {
            const dateA = new Date(a.completedAt || a.date);
            const dateB = new Date(b.completedAt || b.date);
            return dateB - dateA; // Most recent first
        })
        .slice(0, 10);
    
    if (completedMatches.length === 0) {
        recentSection.innerHTML = `
            <div class="no-results-message">
                <p>No completed matches yet. Results will appear here when matches are finished and recorded.</p>
            </div>
        `;
        return;
    }
    
    recentSection.innerHTML = completedMatches.map(match => {
        const completedDate = match.completedAt || match.date;
        const player1Name = escapeHTML(match.player1?.name || 'Player 1');
        const player2Name = escapeHTML(match.player2?.name || 'Player 2');
        const player1Score = match.player1Score ?? 0;
        const player2Score = match.player2Score ?? 0;
        const winnerId = match.winnerId;
        const player1Id = match.player1?.id;
        const player2Id = match.player2?.id;

        return `
            <div class="result-card">
                <div class="result-header">
                    <span class="result-date">${new Date(completedDate).toLocaleDateString()}</span>
                    <span class="result-time">${new Date(completedDate).toLocaleTimeString()}</span>
                </div>
                <div class="result-score">
                    <div class="player-result ${winnerId === player1Id ? 'winner' : ''}">
                        <span class="player-name">${player1Name}</span>
                        <span class="player-score">${player1Score}</span>
                    </div>
                    <div class="vs-separator">vs</div>
                    <div class="player-result ${winnerId === player2Id ? 'winner' : ''}">
                        <span class="player-name">${player2Name}</span>
                        <span class="player-score">${player2Score}</span>
                    </div>
                </div>
                <div class="result-actions">
                    <button class="btn btn-sm btn-outline" onclick="editMatch(${match.id})">Edit</button>
                </div>
            </div>
        `;
    }).join('');
}

// Render ladder table with drag-and-drop functionality
async function renderLadderTable() {
    const ladderTableBody = document.getElementById('ladderTableBody');
    if (!ladderTableBody) return;
    
    if (adminData.players.length === 0) {
        ladderTableBody.innerHTML = `
            <tr class="no-players-row">
                <td colspan="4" class="text-center">No players in the ladder yet. Add players in the Players tab.</td>
            </tr>
        `;
        return;
    }

    // Sort players by rank
    const sortedPlayers = adminData.players.sort((a, b) => a.rank - b.rank);

    ladderTableBody.innerHTML = sortedPlayers.map(player => `
        <tr class="ladder-row" draggable="true" data-player-id="${player.id}">
            <td class="rank-cell">
                <span class="rank-badge">#${player.rank}</span>
            </td>
            <td class="player-cell">
                <div class="player-info">
                    <div class="drag-handle">⋮⋮</div>
                    <span class="player-name">${escapeHTML(player.name)}</span>
                </div>
            </td>
            <td class="record-cell">
                <span class="wins">${player.wins || 0}W</span>
                <span class="losses">${player.losses || 0}L</span>
            </td>
            <td class="actions-cell">
                <button class="btn btn-sm btn-outline" onclick="movePlayerUp(${player.id})" ${player.rank === 1 ? 'disabled' : ''}>↑</button>
                <button class="btn btn-sm btn-outline" onclick="movePlayerDown(${player.id})" ${player.rank === adminData.players.length ? 'disabled' : ''}>↓</button>
            </td>
        </tr>
    `).join('');
    
    // Initialize drag and drop
    initializeLadderDragAndDrop();
}

// Initialize drag and drop for ladder table
function initializeLadderDragAndDrop() {
    const rows = document.querySelectorAll('.ladder-row');
    let draggedElement = null;
    
    rows.forEach(row => {
        row.addEventListener('dragstart', function(e) {
            draggedElement = this;
            this.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', this.outerHTML);
        });
        
        row.addEventListener('dragend', function(e) {
            this.classList.remove('dragging');
            draggedElement = null;
        });
        
        row.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            const afterElement = getDragAfterElement(this.parentNode, e.clientY);
            const dragging = document.querySelector('.dragging');
            
            if (afterElement == null) {
                this.parentNode.appendChild(dragging);
            } else {
                this.parentNode.insertBefore(dragging, afterElement);
            }
        });
        
        row.addEventListener('drop', function(e) {
            e.preventDefault();
            if (draggedElement !== this) {
                updateLadderOrder();
            }
        });
    });
}

// Get the element after which to insert the dragged element
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.ladder-row:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Update ladder order based on current table order
function updateLadderOrder() {
    const rows = document.querySelectorAll('.ladder-row');
    const newOrder = [];
    
    rows.forEach((row, index) => {
        const playerId = parseInt(row.getAttribute('data-player-id'));
        const player = adminData.players.find(p => p.id === playerId);
        if (player) {
            player.rank = index + 1;
            newOrder.push(player);
        }
    });
    
    // Update the players array with new order
    adminData.players = newOrder;
    saveAdminData();
    renderLadderTable();
    renderPlayersTable(); // Update players tab as well
    
    showNotification('Ladder rankings updated!', 'success');
}

// Move player up one position
async function movePlayerUp(playerId) {
    const player = adminData.players.find(p => p.id === playerId);
    if (!player || player.rank === 1) return;

    const playerAbove = adminData.players.find(p => p.rank === player.rank - 1);
    if (playerAbove) {
        // Swap ranks
        const tempRank = player.rank;
        player.rank = playerAbove.rank;
        playerAbove.rank = tempRank;

        saveAdminData();

        renderLadderTable();
        renderPlayersTable();
        showNotification(`${player.name} moved up to rank #${player.rank}`, 'success');
    }
}

// Move player down one position
async function movePlayerDown(playerId) {
    const player = adminData.players.find(p => p.id === playerId);
    if (!player || player.rank === adminData.players.length) return;

    const playerBelow = adminData.players.find(p => p.rank === player.rank + 1);
    if (playerBelow) {
        // Swap ranks
        const tempRank = player.rank;
        player.rank = playerBelow.rank;
        playerBelow.rank = tempRank;

        saveAdminData();

        renderLadderTable();
        renderPlayersTable();
        showNotification(`${player.name} moved down to rank #${player.rank}`, 'info');
    }
}

// Refresh data from server (bypass localStorage cache)
async function refreshFromServer() {
    console.log('🔄 Refreshing data from server...');
    showNotification('Refreshing data from server...', 'info');

    try {
        // Force reload from server, bypassing localStorage
        await loadAdminData(true);

        // Re-render all tables to show fresh data
        await renderPlayersTable();
        await renderScheduledMatches();
        await renderRecentResults();
        await renderLadderTable();
        await updateDashboardStats();

        showNotification('✅ Data refreshed from server successfully!', 'success');
        console.log('✅ Refresh complete');
    } catch (error) {
        console.error('❌ Error refreshing data:', error);
        showNotification('❌ Failed to refresh data from server', 'error');
    }
}

// Recalculate rankings based on wins/losses
function recalculateRankings() {
    if (adminData.players.length === 0) {
        alert('No players to rank.');
        return;
    }
    
    if (confirm('Recalculate all rankings based on current wins/losses? This will override any manual adjustments.')) {
        recalculateRanks();
        
        saveAdminData();
        renderLadderTable();
        renderPlayersTable();
        showNotification('Rankings recalculated based on match records!', 'success');
    }
}

// Reset ladder (for testing)
function resetLadder() {
    if (confirm('Reset all player rankings to default? This will set ranks based on join order.')) {
        adminData.players.forEach((player, index) => {
            player.rank = index + 1;
            player.wins = 0;
            player.losses = 0;
        });
        
        saveAdminData();
        renderLadderTable();
        renderPlayersTable();
        showNotification('Ladder reset to default state!', 'info');
    }
}

// Save current rankings locally
async function saveRankings() {
    if (!adminData.players || adminData.players.length === 0) {
        alert('No players to save rankings for.');
        return;
    }

    try {
        saveAdminData();
        showNotification('Rankings saved locally. Publish to push updates live.', 'success');
    } catch (error) {
        console.error('❌ Critical error saving rankings:', error);
        alert(`Error saving rankings: ${error.message}`);
    }
}

// Notification function for admin panel
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'admin-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--neon-green)' : type === 'error' ? 'var(--crimson-red)' : 'var(--electric-cyan)'};
        color: var(--obsidian-black);
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        z-index: 10001;
        animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s;
        max-width: 300px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            document.body.removeChild(notification);
        }
    }, 3000);
}

// Publish Modal Functions
function openPublishModal() {
    console.log('🎯 Opening publish modal');
    const modal = document.getElementById('publishModal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
    } else {
        console.error('❌ Publish modal not found');
    }
}

function closePublishModal() {
    const modal = document.getElementById('publishModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        // Clear form
        const form = document.getElementById('publishForm');
        if (form) form.reset();
    }
}

async function publishChanges() {
    console.log('📤 Publishing changes to GitHub...');

    const form = document.getElementById('publishForm');
    const commitMessage = form.querySelector('[name="commitMessage"]').value;

    if (!commitMessage.trim()) {
        alert('Please enter a commit message');
        return;
    }

    const token = localStorage.getItem('admin_jwt_token');
    if (!token) {
        alert('Session expired. Please log in again.');
        logout(true);
        return;
    }

    try {
        const response = await fetch('/api/publish', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                commitMessage: commitMessage,
                players: adminData.players,
                matches: adminData.matches,
                meta: {
                    version: '1.0.0',
                    updated: new Date().toISOString()
                }
            })
        });

        if (response.status === 401) {
            alert('Session expired. Please log in again.');
            logout(true);
            return;
        }

        const result = await response.json();

        if (response.ok) {
            console.log('✅ Publish result:', result);
            console.log('📊 Deployment status:', result.deployment?.status);
            console.log('📊 Deployment message:', result.deployment?.message);

            let message = '✅ Changes published successfully!';
            if (result.deployment) {
                message += '\n' + result.deployment.message;
            }
            showNotification(message, 'success');
            closePublishModal();

            localStorage.removeItem('poolLadderAdminData');

            // Wait longer if deployment was triggered to allow Vercel to deploy
            const waitTime = result.deployment?.status === 'triggered' ? 90000 : 2000;

            setTimeout(async () => {
                await loadAdminData(true); // Force refresh from server
                await renderPlayersTable();
                await renderScheduledMatches();
                await renderRecentResults();
                await renderLadderTable();
                await updateDashboardStats();
            }, waitTime);

            if (result.deployment?.status === 'triggered') {
                alert('Changes published successfully!\n\nThe website will be updated in 1-2 minutes. The page will automatically refresh to show the live data.');
            }
        } else {
            throw new Error(result.error || 'Publish failed');
        }
    } catch (error) {
        console.error('❌ Publish error:', error);
        alert(`Failed to publish changes: ${error.message}`);
    }
}

// Export/Import Functions
function exportData() {
    const dataStr = JSON.stringify(adminData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pool-ladder-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    console.log('✅ Data exported');
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);

            if (confirm(`Import data?\n\nPlayers: ${importedData.players?.length || 0}\nMatches: ${importedData.matches?.length || 0}\n\nThis will replace current data.`)) {
                adminData = importedData;
                saveAdminData();
                location.reload();
            }
        } catch (error) {
            alert('Error importing data: Invalid JSON file');
            console.error('Import error:', error);
        }
    };
    reader.readAsText(file);
}

// Make functions global for onclick handlers
window.openAddPlayerModal = openAddPlayerModal;
window.closeAddPlayerModal = closeAddPlayerModal;
window.addNewPlayer = addNewPlayer;
window.openChangePasswordModal = openChangePasswordModal;
window.closeChangePasswordModal = closeChangePasswordModal;
window.openScheduleMatchModal = openScheduleMatchModal;
window.closeScheduleMatchModal = closeScheduleMatchModal;
window.scheduleMatch = scheduleMatch;
window.editPlayerName = editPlayerName;
window.logout = logout;
window.removePlayer = removePlayer;
window.cancelMatch = cancelMatch;
window.recordMatchResult = recordMatchResult;
window.movePlayerUp = movePlayerUp;
window.movePlayerDown = movePlayerDown;
window.recalculateRankings = recalculateRankings;
window.resetLadder = resetLadder;
window.saveRankings = saveRankings;
window.openPublishModal = openPublishModal;
window.closePublishModal = closePublishModal;
window.publishChanges = publishChanges;
window.exportData = exportData;
window.handleFileSelect = handleFileSelect;

// Add CSS styles for the new player list
const adminStyles = document.createElement('style');
adminStyles.textContent = `
    .btn-success {
        background: var(--neon-green);
        color: var(--obsidian-black);
        border: 2px solid var(--neon-green);
        font-weight: 600;
    }

    .btn-success:hover {
        background: transparent;
        color: var(--neon-green);
        box-shadow: 0 0 15px var(--neon-green);
    }

    .players-list {
        background: var(--deep-charcoal);
        border-radius: 8px;
        padding: 1rem;
        border: 1px solid rgba(0, 212, 255, 0.2);
    }

    .player-line {
        display: flex;
        align-items: center;
        padding: 1rem;
        margin-bottom: 0.5rem;
        background: rgba(0, 212, 255, 0.05);
        border: 1px solid rgba(0, 212, 255, 0.1);
        border-radius: 6px;
        transition: all 0.3s ease;
    }

    .player-line:hover {
        background: rgba(0, 212, 255, 0.1);
        border-color: rgba(0, 212, 255, 0.3);
    }

    .player-line:last-child {
        margin-bottom: 0;
    }

    .rank-number {
        color: var(--electric-cyan);
        font-weight: bold;
        font-size: 1.1rem;
        min-width: 40px;
        margin-right: 1rem;
    }

    .player-name {
        flex: 1;
        color: var(--chrome-silver);
        font-size: 1rem;
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        transition: all 0.3s ease;
    }

    .player-name:hover {
        background: rgba(0, 212, 255, 0.1);
        color: var(--electric-cyan);
    }

    .player-actions {
        display: flex;
        gap: 0.5rem;
    }

    .no-players {
        text-align: center;
        padding: 2rem;
        color: var(--chrome-silver);
        opacity: 0.7;
    }

    .match-card {
        background: rgba(0, 212, 255, 0.05);
        border: 1px solid rgba(0, 212, 255, 0.2);
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1rem;
        transition: all 0.3s ease;
    }

    .match-card:hover {
        border-color: var(--electric-cyan);
        background: rgba(0, 212, 255, 0.1);
    }

    .match-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        color: var(--electric-cyan);
    }

    .match-players {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 1rem 0;
        font-size: 1.1rem;
        color: var(--chrome-silver);
    }

    .match-players .player {
        font-weight: 500;
    }

    .match-players .vs {
        margin: 0 1rem;
        color: var(--electric-cyan);
        font-weight: bold;
    }

    .match-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
    }

    .no-matches-message {
        text-align: center;
        padding: 2rem;
        color: var(--chrome-silver);
        opacity: 0.7;
    }

    .result-card {
        background: rgba(57, 255, 20, 0.05);
        border: 1px solid rgba(57, 255, 20, 0.2);
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1rem;
        transition: all 0.3s ease;
    }

    .result-card:hover {
        border-color: var(--neon-green);
        background: rgba(57, 255, 20, 0.1);
    }

    .result-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1rem;
        font-size: 0.85rem;
        color: var(--neon-green);
    }

    .result-score {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .player-result {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0.5rem;
        flex: 1;
        border-radius: 6px;
        transition: all 0.3s ease;
    }

    .player-result.winner {
        background: rgba(57, 255, 20, 0.1);
        border: 1px solid rgba(57, 255, 20, 0.3);
    }

    .player-result .player-name {
        font-size: 0.9rem;
        color: var(--chrome-silver);
        margin-bottom: 0.25rem;
    }

    .player-result .player-score {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--electric-cyan);
    }

    .player-result.winner .player-score {
        color: var(--neon-green);
    }

    .vs-separator {
        color: var(--electric-cyan);
        font-weight: bold;
        margin: 0 1rem;
        font-size: 0.9rem;
    }

    .no-results-message {
        text-align: center;
        padding: 2rem;
        color: var(--chrome-silver);
        opacity: 0.7;
    }

    /* Ladder Table Styles */
    .ladder-instructions {
        color: var(--chrome-silver);
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: rgba(0, 212, 255, 0.05);
        border: 1px solid rgba(0, 212, 255, 0.2);
        border-radius: 8px;
    }

    .ladder-table-container {
        background: var(--deep-charcoal);
        border-radius: 8px;
        padding: 1rem;
        border: 1px solid rgba(0, 212, 255, 0.2);
        margin-bottom: 2rem;
    }

    .ladder-table {
        width: 100%;
        border-collapse: collapse;
        color: var(--chrome-silver);
    }

    .ladder-table th {
        background: var(--obsidian-black);
        padding: 0.75rem 1rem;
        text-align: left;
        border-bottom: 2px solid var(--electric-cyan);
        color: var(--electric-cyan);
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.9rem;
    }

    .ladder-table td {
        padding: 1rem;
        border-bottom: 1px solid rgba(192, 192, 192, 0.2);
    }

    .ladder-row {
        background: rgba(0, 212, 255, 0.05);
        transition: all 0.3s ease;
        cursor: grab;
    }

    .ladder-row:hover {
        background: rgba(0, 212, 255, 0.1);
        border-left: 4px solid var(--electric-cyan);
    }

    .ladder-row.dragging {
        opacity: 0.7;
        background: rgba(0, 212, 255, 0.2);
        cursor: grabbing;
    }

    .rank-badge {
        background: var(--electric-cyan);
        color: var(--obsidian-black);
        padding: 0.25rem 0.5rem;
        border-radius: 20px;
        font-weight: bold;
        font-size: 0.9rem;
    }

    .player-cell {
        position: relative;
    }

    .player-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .drag-handle {
        color: var(--chrome-silver);
        font-size: 1.2rem;
        cursor: grab;
        opacity: 0.6;
        transition: opacity 0.3s ease;
    }

    .ladder-row:hover .drag-handle {
        opacity: 1;
        color: var(--electric-cyan);
    }

    .ladder-row.dragging .drag-handle {
        cursor: grabbing;
    }

    .record-cell {
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }

    .wins {
        color: var(--neon-green);
        font-weight: 600;
    }

    .losses {
        color: var(--crimson-red);
        font-weight: 600;
    }

    .points {
        color: var(--electric-cyan);
        font-weight: bold;
        font-size: 1.1rem;
    }

    .actions-cell {
        display: flex;
        gap: 0.25rem;
    }

    .text-center {
        text-align: center;
    }

    .ladder-info {
        background: rgba(57, 255, 20, 0.05);
        border: 1px solid rgba(57, 255, 20, 0.2);
        border-radius: 8px;
        padding: 1.5rem;
        color: var(--chrome-silver);
    }

    .ladder-info h4 {
        color: var(--neon-green);
        margin-bottom: 1rem;
    }

    .ladder-info ul {
        margin: 0;
        padding-left: 1.5rem;
    }

    .ladder-info li {
        margin-bottom: 0.5rem;
        line-height: 1.5;
    }

    /* Animation keyframes for notifications */
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeOut {
        to { opacity: 0; transform: translateX(100%); }
    }
`;
document.head.appendChild(adminStyles);
