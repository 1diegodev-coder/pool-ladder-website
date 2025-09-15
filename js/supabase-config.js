// Supabase Configuration and Database Functions
// This file handles all database operations for the pool ladder

// Supabase credentials
const SUPABASE_URL = 'https://ngcgnklizohgoxmqhpdw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nY2dua2xpem9oZ294bXFocGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NzcxMDAsImV4cCI6MjA3MzQ1MzEwMH0.jrc1XyDBH52TuWoc_ycrweMT54yAcg0H9BACxneO9uw';

console.log('🔍 Supabase config loaded');
console.log('📡 URL:', SUPABASE_URL);
console.log('🔑 Key present:', !!SUPABASE_ANON_KEY);

// Initialize Supabase client (will be loaded from CDN)
let supabase;

// Initialize Supabase client when the library loads
function initializeSupabase() {
    try {
        // Check if Supabase global is available
        if (!window.supabase) {
            console.log('⏳ Supabase library not loaded yet');
            return false;
        }
        
        // Check if createClient function exists
        if (typeof window.supabase.createClient !== 'function') {
            console.log('⏳ Supabase createClient not available yet');
            return false;
        }
        
        // Only initialize if we haven't already
        if (typeof supabase === 'undefined') {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase initialized successfully');
            console.log('🔗 Connected to:', SUPABASE_URL);
            return true;
        }
        
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error);
        return false;
    }
}

// Wait for Supabase to load
function waitForSupabase(callback, maxAttempts = 50) {
    let attempts = 0;
    
    const checkSupabase = () => {
        attempts++;
        console.log(`🔄 Supabase check attempt ${attempts}/${maxAttempts}`);
        console.log('🌐 window.supabase exists:', !!window.supabase);
        
        if (window.supabase) {
            console.log('📦 Supabase object type:', typeof window.supabase);
            console.log('🔧 createClient available:', typeof window.supabase.createClient);
        }
        
        // Try direct initialization
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            try {
                if (!supabase) {
                    console.log('🚀 Attempting direct Supabase creation...');
                    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                    console.log('✅ Supabase client created successfully!');
                    console.log('🔗 Client object:', !!supabase);
                }
                callback();
                return;
            } catch (error) {
                console.error('❌ Error creating Supabase client:', error);
            }
        }
        
        if (attempts < maxAttempts) {
            setTimeout(checkSupabase, 300);
        } else {
            console.error('❌ Max attempts reached, falling back to localStorage');
            callback();
        }
    };
    
    checkSupabase();
}

// Database Functions
class PoolLadderDB {
    constructor() {
        this.isSupabaseReady = false;
    }

    // Check if Supabase is available, fallback to localStorage
    async isReady() {
        return new Promise((resolve) => {
            if (supabase) {
                this.isSupabaseReady = true;
                resolve(true);
            } else {
                console.warn('⚠️ Supabase not available, using localStorage fallback');
                resolve(false);
            }
        });
    }

    // PLAYER OPERATIONS
    async getAllPlayers() {
        if (await this.isReady() && this.isSupabaseReady) {
            try {
                const { data, error } = await supabase
                    .from('players')
                    .select('*')
                    .order('rank', { ascending: true });
                
                if (error) throw error;
                return data || [];
            } catch (error) {
                console.error('Error fetching players:', error);
                return this.getPlayersFromLocalStorage();
            }
        } else {
            return this.getPlayersFromLocalStorage();
        }
    }

    async addPlayer(playerData) {
        if (await this.isReady() && this.isSupabaseReady) {
            try {
                // Get the next rank
                const players = await this.getAllPlayers();
                const nextRank = players.length + 1;
                
                const newPlayer = {
                    name: playerData.name,
                    rank: nextRank,
                    wins: playerData.wins || 0,
                    losses: playerData.losses || 0,
                    status: playerData.status || 'active'
                };

                const { data, error } = await supabase
                    .from('players')
                    .insert([newPlayer])
                    .select()
                    .single();

                if (error) throw error;
                return data;
            } catch (error) {
                console.error('Error adding player:', error);
                return this.addPlayerToLocalStorage(playerData);
            }
        } else {
            return this.addPlayerToLocalStorage(playerData);
        }
    }

    async updatePlayer(playerId, updates) {
        if (await this.isReady() && this.isSupabaseReady) {
            try {
                const { data, error } = await supabase
                    .from('players')
                    .update(updates)
                    .eq('id', playerId)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            } catch (error) {
                console.error('Error updating player:', error);
                return this.updatePlayerInLocalStorage(playerId, updates);
            }
        } else {
            return this.updatePlayerInLocalStorage(playerId, updates);
        }
    }

    async deletePlayer(playerId) {
        if (await this.isReady() && this.isSupabaseReady) {
            try {
                const { error } = await supabase
                    .from('players')
                    .delete()
                    .eq('id', playerId);

                if (error) throw error;
                return true;
            } catch (error) {
                console.error('Error deleting player:', error);
                return this.deletePlayerFromLocalStorage(playerId);
            }
        } else {
            return this.deletePlayerFromLocalStorage(playerId);
        }
    }

    // MATCH OPERATIONS
    async getAllMatches() {
        if (await this.isReady() && this.isSupabaseReady) {
            try {
                const { data, error } = await supabase
                    .from('matches')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                return data || [];
            } catch (error) {
                console.error('Error fetching matches:', error);
                return this.getMatchesFromLocalStorage();
            }
        } else {
            return this.getMatchesFromLocalStorage();
        }
    }

    async addMatch(matchData) {
        if (await this.isReady() && this.isSupabaseReady) {
            try {
                const { data, error } = await supabase
                    .from('matches')
                    .insert([matchData])
                    .select()
                    .single();

                if (error) throw error;
                return data;
            } catch (error) {
                console.error('Error adding match:', error);
                return this.addMatchToLocalStorage(matchData);
            }
        } else {
            return this.addMatchToLocalStorage(matchData);
        }
    }

    async updateMatch(matchId, updates) {
        if (await this.isReady() && this.isSupabaseReady) {
            try {
                const { data, error } = await supabase
                    .from('matches')
                    .update(updates)
                    .eq('id', matchId)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            } catch (error) {
                console.error('Error updating match:', error);
                return this.updateMatchInLocalStorage(matchId, updates);
            }
        } else {
            return this.updateMatchInLocalStorage(matchId, updates);
        }
    }

    // FALLBACK LOCALSTORAGE METHODS
    getPlayersFromLocalStorage() {
        const data = localStorage.getItem('poolLadderAdminData');
        return data ? JSON.parse(data).players || [] : [];
    }

    addPlayerToLocalStorage(playerData) {
        const adminData = JSON.parse(localStorage.getItem('poolLadderAdminData') || '{"players":[],"matches":[]}');
        const newPlayer = {
            id: Date.now(),
            ...playerData,
            created_at: new Date().toISOString(),
            last_active: new Date().toISOString()
        };
        adminData.players.push(newPlayer);
        localStorage.setItem('poolLadderAdminData', JSON.stringify(adminData));
        return newPlayer;
    }

    updatePlayerInLocalStorage(playerId, updates) {
        const adminData = JSON.parse(localStorage.getItem('poolLadderAdminData') || '{"players":[],"matches":[]}');
        const playerIndex = adminData.players.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
            adminData.players[playerIndex] = { ...adminData.players[playerIndex], ...updates };
            localStorage.setItem('poolLadderAdminData', JSON.stringify(adminData));
            return adminData.players[playerIndex];
        }
        return null;
    }

    deletePlayerFromLocalStorage(playerId) {
        const adminData = JSON.parse(localStorage.getItem('poolLadderAdminData') || '{"players":[],"matches":[]}');
        adminData.players = adminData.players.filter(p => p.id !== playerId);
        localStorage.setItem('poolLadderAdminData', JSON.stringify(adminData));
        return true;
    }

    getMatchesFromLocalStorage() {
        const data = localStorage.getItem('poolLadderAdminData');
        return data ? JSON.parse(data).matches || [] : [];
    }

    addMatchToLocalStorage(matchData) {
        const adminData = JSON.parse(localStorage.getItem('poolLadderAdminData') || '{"players":[],"matches":[]}');
        const newMatch = {
            id: Date.now(),
            ...matchData,
            created_at: new Date().toISOString()
        };
        adminData.matches.push(newMatch);
        localStorage.setItem('poolLadderAdminData', JSON.stringify(adminData));
        return newMatch;
    }

    updateMatchInLocalStorage(matchId, updates) {
        const adminData = JSON.parse(localStorage.getItem('poolLadderAdminData') || '{"players":[],"matches":[]}');
        const matchIndex = adminData.matches.findIndex(m => m.id === matchId);
        if (matchIndex !== -1) {
            adminData.matches[matchIndex] = { ...adminData.matches[matchIndex], ...updates };
            localStorage.setItem('poolLadderAdminData', JSON.stringify(adminData));
            return adminData.matches[matchIndex];
        }
        return null;
    }
}

// Global database instance
const poolDB = new PoolLadderDB();

// Export for use in other files
window.poolDB = poolDB;