// Sample data for The Pool Ladder
// This script populates the system with sample players and matches

const samplePlayers = [
    {
        id: 1,
        name: "Marcus Rodriguez",
        email: "marcus.rodriguez@email.com",
        rank: 1,
        wins: 18,
        losses: 3,
        points: 875,
        status: "active",
        phone: "(555) 123-4567",
        notes: "Tournament champion, excellent break shot",
        created: "2024-08-15T10:00:00.000Z",
        lastActive: "2025-09-14T18:30:00.000Z"
    },
    {
        id: 2,
        name: "Sarah Chen",
        email: "sarah.chen@email.com",
        rank: 2,
        wins: 15,
        losses: 4,
        points: 750,
        status: "active",
        phone: "(555) 234-5678",
        notes: "Strategic player, strong defensive game",
        created: "2024-08-20T14:00:00.000Z",
        lastActive: "2025-09-14T16:45:00.000Z"
    },
    {
        id: 3,
        name: "David Thompson",
        email: "david.thompson@email.com",
        rank: 3,
        wins: 12,
        losses: 6,
        points: 600,
        status: "active",
        phone: "(555) 345-6789",
        notes: "Consistent player, good under pressure",
        created: "2024-09-01T12:00:00.000Z",
        lastActive: "2025-09-13T20:15:00.000Z"
    },
    {
        id: 4,
        name: "Jennifer Walsh",
        email: "jennifer.walsh@email.com",
        rank: 4,
        wins: 10,
        losses: 7,
        points: 525,
        status: "active",
        phone: "(555) 456-7890",
        notes: "Technical player, precise shots",
        created: "2024-09-05T16:30:00.000Z",
        lastActive: "2025-09-12T19:00:00.000Z"
    },
    {
        id: 5,
        name: "Michael O'Connor",
        email: "michael.oconnor@email.com",
        rank: 5,
        wins: 8,
        losses: 8,
        points: 400,
        status: "active",
        phone: "(555) 567-8901",
        notes: "Improving rapidly, good attitude",
        created: "2024-09-10T11:00:00.000Z",
        lastActive: "2025-09-11T17:30:00.000Z"
    },
    {
        id: 6,
        name: "Amanda Foster",
        email: "amanda.foster@email.com",
        rank: 6,
        wins: 7,
        losses: 9,
        points: 350,
        status: "active",
        phone: "(555) 678-9012",
        notes: "New to competitive play, shows promise",
        created: "2024-09-15T13:45:00.000Z",
        lastActive: "2025-09-10T15:20:00.000Z"
    },
    {
        id: 7,
        name: "Robert Kim",
        email: "robert.kim@email.com",
        rank: 7,
        wins: 5,
        losses: 10,
        points: 275,
        status: "active",
        phone: "(555) 789-0123",
        notes: "Casual player, plays for fun",
        created: "2024-09-20T09:30:00.000Z",
        lastActive: "2025-09-09T14:45:00.000Z"
    },
    {
        id: 8,
        name: "Lisa Martinez",
        email: "lisa.martinez@email.com",
        rank: 8,
        wins: 4,
        losses: 11,
        points: 225,
        status: "active",
        phone: "(555) 890-1234",
        notes: "Working on consistency",
        created: "2024-09-25T15:15:00.000Z",
        lastActive: "2025-09-08T18:10:00.000Z"
    }
];

const sampleMatches = [
    // Recent completed matches
    {
        id: 1,
        player1_name: "Marcus Rodriguez",
        player2_name: "Sarah Chen",
        player1_score: 7,
        player2_score: 5,
        winner_name: "Marcus Rodriguez",
        date: "2025-09-14",
        time: "19:00",
        status: "completed",
        created_at: "2025-09-14T19:00:00.000Z"
    },
    {
        id: 2,
        player1_name: "David Thompson",
        player2_name: "Jennifer Walsh",
        player1_score: 6,
        player2_score: 7,
        winner_name: "Jennifer Walsh",
        date: "2025-09-13",
        time: "20:30",
        status: "completed",
        created_at: "2025-09-13T20:30:00.000Z"
    },
    {
        id: 3,
        player1_name: "Michael O'Connor",
        player2_name: "Amanda Foster",
        player1_score: 7,
        player2_score: 4,
        winner_name: "Michael O'Connor",
        date: "2025-09-12",
        time: "18:45",
        status: "completed",
        created_at: "2025-09-12T18:45:00.000Z"
    },
    {
        id: 4,
        player1_name: "Sarah Chen",
        player2_name: "David Thompson",
        player1_score: 7,
        player2_score: 3,
        winner_name: "Sarah Chen",
        date: "2025-09-11",
        time: "19:15",
        status: "completed",
        created_at: "2025-09-11T19:15:00.000Z"
    },
    {
        id: 5,
        player1_name: "Robert Kim",
        player2_name: "Lisa Martinez",
        player1_score: 5,
        player2_score: 7,
        winner_name: "Lisa Martinez",
        date: "2025-09-10",
        time: "17:30",
        status: "completed",
        created_at: "2025-09-10T17:30:00.000Z"
    },
    
    // Upcoming scheduled matches
    {
        id: 6,
        player1_name: "Marcus Rodriguez",
        player2_name: "David Thompson",
        date: "2025-09-16",
        time: "19:00",
        status: "scheduled",
        created_at: "2025-09-14T10:00:00.000Z"
    },
    {
        id: 7,
        player1_name: "Sarah Chen",
        player2_name: "Jennifer Walsh",
        date: "2025-09-17",
        time: "20:00",
        status: "scheduled",
        created_at: "2025-09-14T11:00:00.000Z"
    },
    {
        id: 8,
        player1_name: "Michael O'Connor",
        player2_name: "Robert Kim",
        date: "2025-09-18",
        time: "18:30",
        status: "scheduled",
        created_at: "2025-09-14T12:00:00.000Z"
    },
    {
        id: 9,
        player1_name: "Amanda Foster",
        player2_name: "Lisa Martinez",
        date: "2025-09-19",
        time: "19:30",
        status: "scheduled",
        created_at: "2025-09-14T13:00:00.000Z"
    }
];

// Function to populate localStorage with sample data
function populateSampleData() {
    console.log('🎱 Populating Pool Ladder with sample data...');
    
    // Store players
    localStorage.setItem('players', JSON.stringify(samplePlayers));
    console.log(`✅ Added ${samplePlayers.length} players`);
    
    // Store matches
    localStorage.setItem('matches', JSON.stringify(sampleMatches));
    console.log(`✅ Added ${sampleMatches.length} matches`);
    
    console.log('🚀 Sample data loaded successfully!');
    console.log('📊 Ladder Rankings:');
    samplePlayers.forEach(player => {
        console.log(`  ${player.rank}. ${player.name} (${player.wins}W-${player.losses}L)`);
    });
}

// Function to clear all data
function clearAllData() {
    localStorage.removeItem('players');
    localStorage.removeItem('matches');
    console.log('🗑️ All data cleared');
}

// Make functions available globally
window.populateSampleData = populateSampleData;
window.clearAllData = clearAllData;

// Auto-populate disabled for production deployment
if (typeof window !== 'undefined') {
    console.log('📋 Sample data available but not auto-loaded');
    console.log('💡 To load sample data, run: populateSampleData()');
    console.log('💡 To clear all data, run: clearAllData()');
}