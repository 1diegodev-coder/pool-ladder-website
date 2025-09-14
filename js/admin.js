// Simplified Admin Panel JavaScript

// Global data storage
let adminData = {
    players: [],
    matches: [],
    config: {}
};

// Load data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadAdminData();
    initializeAdminTabs();
    renderPlayersTable();
    renderScheduledMatches();
    renderRecentResults();
    renderLadderTable();
    updateDashboardStats();
    
    console.log('Admin panel initialized');
});

// Data persistence
function loadAdminData() {
    const savedData = localStorage.getItem('poolLadderAdminData');
    if (savedData) {
        try {
            adminData = JSON.parse(savedData);
        } catch (error) {
            console.error('Error loading admin data:', error);
        }
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

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.style.display = 'none');
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            const targetContent = document.getElementById(targetTab + '-tab');
            if (targetContent) {
                targetContent.style.display = 'block';
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

function addNewPlayer() {
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
    
    // Create new player
    const newPlayer = {
        id: Date.now(),
        name: playerName,
        rank: adminData.players.length + 1,
        wins: 0,
        losses: 0,
        status: 'active',
        created: new Date().toISOString(),
        lastActive: new Date().toISOString()
    };
    
    // Add to players array
    adminData.players.push(newPlayer);
    
    // Save data
    saveAdminData();
    
    // Update display
    renderPlayersTable();
    renderLadderTable();
    updateDashboardStats();
    
    // Close modal
    closeAddPlayerModal();
    
    alert(`Player "${playerName}" added successfully!`);
}

// Render players list
function renderPlayersTable() {
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
            <span class="player-name" ondblclick="editPlayerName(${player.id})" title="Double-click to edit">${player.name}</span>
            <div class="player-actions">
                <button class="btn btn-sm btn-danger" onclick="removePlayer(${player.id})">Remove</button>
            </div>
        </div>
    `).join('');
}

// Remove player function
function removePlayer(playerId) {
    if (confirm('Are you sure you want to remove this player?')) {
        adminData.players = adminData.players.filter(player => player.id !== playerId);
        
        // Recalculate ranks
        adminData.players.forEach((player, index) => {
            player.rank = index + 1;
        });
        
        saveAdminData();
        renderPlayersTable();
        updateDashboardStats();
        
        alert('Player removed successfully!');
    }
}

// Update dashboard stats
function updateDashboardStats() {
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
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // In a real app, this would clear sessions
        alert('Logged out successfully!');
        window.location.href = '../index.html';
    }
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
function openScheduleMatchModal() {
    if (adminData.players.length < 2) {
        alert('You need at least 2 players to schedule a match.');
        return;
    }
    
    const modal = document.getElementById('scheduleMatchModal');
    if (modal) {
        // Populate player dropdowns
        populatePlayerDropdowns();
        modal.style.display = 'flex';
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        modal.querySelector('input[name="matchDate"]').value = today;
        
        // Set default time to 7 PM
        modal.querySelector('input[name="matchTime"]').value = '19:00';
    }
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
    const player1Select = document.querySelector('select[name="player1"]');
    const player2Select = document.querySelector('select[name="player2"]');
    
    if (!player1Select || !player2Select) return;
    
    // Clear existing options except first
    player1Select.innerHTML = '<option value="">Select Player 1</option>';
    player2Select.innerHTML = '<option value="">Select Player 2</option>';
    
    // Add player options
    adminData.players.forEach(player => {
        const option1 = new Option(player.name, player.id);
        const option2 = new Option(player.name, player.id);
        player1Select.add(option1);
        player2Select.add(option2);
    });
}

function scheduleMatch() {
    const form = document.getElementById('scheduleMatchForm');
    const formData = new FormData(form);
    
    const player1Id = parseInt(formData.get('player1'));
    const player2Id = parseInt(formData.get('player2'));
    const matchDate = formData.get('matchDate');
    const matchTime = formData.get('matchTime');
    
    // Validation
    if (!player1Id || !player2Id || !matchDate || !matchTime) {
        alert('Please fill in all fields.');
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
    
    // Create new match
    const newMatch = {
        id: Date.now(),
        player1: {
            id: player1.id,
            name: player1.name
        },
        player2: {
            id: player2.id,
            name: player2.name
        },
        date: matchDate,
        time: matchTime,
        status: 'scheduled',
        created: new Date().toISOString()
    };
    
    // Add to matches array
    adminData.matches.push(newMatch);
    saveAdminData();
    
    // Update display
    renderScheduledMatches();
    updateDashboardStats();
    
    // Close modal
    closeScheduleMatchModal();
    
    alert(`Match scheduled: ${player1.name} vs ${player2.name} on ${matchDate} at ${matchTime}`);
}

function renderScheduledMatches() {
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
    
    scheduledSection.innerHTML = scheduledMatches.map(match => `
        <div class="match-card">
            <div class="match-header">
                <span class="match-date">${new Date(match.date).toLocaleDateString()}</span>
                <span class="match-time">${match.time}</span>
            </div>
            <div class="match-players">
                <span class="player">${match.player1.name}</span>
                <span class="vs">vs</span>
                <span class="player">${match.player2.name}</span>
            </div>
            <div class="match-actions">
                <button class="btn btn-sm btn-outline" onclick="recordMatchResult(${match.id})">Record Result</button>
                <button class="btn btn-sm btn-danger" onclick="cancelMatch(${match.id})">Cancel</button>
            </div>
        </div>
    `).join('');
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

function recordMatchResult(matchId) {
    const match = adminData.matches.find(m => m.id === matchId);
    if (!match) return;
    
    // Get scores from both players
    const player1Score = prompt(`Enter score for ${match.player1.name}:`, '0');
    if (player1Score === null) return; // User cancelled
    
    const player2Score = prompt(`Enter score for ${match.player2.name}:`, '0');
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
    
    // Determine winner
    const winner = score1 > score2 ? match.player1 : match.player2;
    const loser = score1 > score2 ? match.player2 : match.player1;
    
    // Update match data
    match.status = 'completed';
    match.player1Score = score1;
    match.player2Score = score2;
    match.winner = winner;
    match.loser = loser;
    match.completedDate = new Date().toISOString();
    
    // Update player stats
    updatePlayerStats(winner.id, loser.id);
    
    saveAdminData();
    renderScheduledMatches();
    renderRecentResults();
    updateDashboardStats();
    
    alert(`Match result recorded:\n${match.player1.name}: ${score1}\n${match.player2.name}: ${score2}\n\nWinner: ${winner.name}`);
}

// Update player statistics after match completion
function updatePlayerStats(winnerId, loserId) {
    const winner = adminData.players.find(p => p.id === winnerId);
    const loser = adminData.players.find(p => p.id === loserId);
    
    if (winner && loser) {
        // Update win/loss records
        winner.wins = (winner.wins || 0) + 1;
        loser.losses = (loser.losses || 0) + 1;
        
        // Update last active
        winner.lastActive = new Date().toISOString();
        loser.lastActive = new Date().toISOString();
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
function renderRecentResults() {
    const recentSection = document.querySelector('.matches-section:last-child .admin-match-cards');
    if (!recentSection) return;
    
    const completedMatches = adminData.matches
        .filter(match => match.status === 'completed')
        .sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate)) // Most recent first
        .slice(0, 10); // Show only last 10 matches
    
    if (completedMatches.length === 0) {
        recentSection.innerHTML = `
            <div class="no-results-message">
                <p>No completed matches yet. Results will appear here when matches are finished and recorded.</p>
            </div>
        `;
        return;
    }
    
    recentSection.innerHTML = completedMatches.map(match => `
        <div class="result-card">
            <div class="result-header">
                <span class="result-date">${new Date(match.completedDate).toLocaleDateString()}</span>
                <span class="result-time">${new Date(match.completedDate).toLocaleTimeString()}</span>
            </div>
            <div class="result-score">
                <div class="player-result ${match.winner.id === match.player1.id ? 'winner' : ''}">
                    <span class="player-name">${match.player1.name}</span>
                    <span class="player-score">${match.player1Score}</span>
                </div>
                <div class="vs-separator">vs</div>
                <div class="player-result ${match.winner.id === match.player2.id ? 'winner' : ''}">
                    <span class="player-name">${match.player2.name}</span>
                    <span class="player-score">${match.player2Score}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Render ladder table with drag-and-drop functionality
function renderLadderTable() {
    const ladderTableBody = document.getElementById('ladderTableBody');
    if (!ladderTableBody) return;
    
    if (adminData.players.length === 0) {
        ladderTableBody.innerHTML = `
            <tr class="no-players-row">
                <td colspan="6" class="text-center">No players in the ladder yet. Add players in the Players tab.</td>
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
                    <span class="player-name">${player.name}</span>
                </div>
            </td>
            <td class="record-cell">
                <span class="wins">${player.wins || 0}W</span>
                <span class="losses">${player.losses || 0}L</span>
            </td>
            <td class="last-active-cell">
                ${player.lastActive ? new Date(player.lastActive).toLocaleDateString() : 'Never'}
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
function movePlayerUp(playerId) {
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
function movePlayerDown(playerId) {
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

// Add CSS styles for the new player list
const adminStyles = document.createElement('style');
adminStyles.textContent = `
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