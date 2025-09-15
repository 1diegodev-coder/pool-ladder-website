-- Pool Ladder Database Schema
-- Run this in Supabase SQL Editor

-- Create players table
CREATE TABLE players (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    rank INTEGER NOT NULL DEFAULT 1,
    wins INTEGER NOT NULL DEFAULT 0,
    losses INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT players_name_unique UNIQUE (name),
    CONSTRAINT players_rank_unique UNIQUE (rank),
    CONSTRAINT players_status_check CHECK (status IN ('active', 'inactive', 'suspended'))
);

-- Create matches table
CREATE TABLE matches (
    id BIGSERIAL PRIMARY KEY,
    player1_id BIGINT REFERENCES players(id) ON DELETE CASCADE,
    player1_name TEXT NOT NULL,
    player2_id BIGINT REFERENCES players(id) ON DELETE CASCADE,
    player2_name TEXT NOT NULL,
    match_date DATE NOT NULL,
    match_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled',
    player1_score INTEGER,
    player2_score INTEGER,
    winner_id BIGINT REFERENCES players(id) ON DELETE SET NULL,
    winner_name TEXT,
    loser_id BIGINT REFERENCES players(id) ON DELETE SET NULL,
    loser_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT matches_status_check CHECK (status IN ('scheduled', 'completed', 'cancelled'))
);

-- Create indexes for better performance
CREATE INDEX idx_players_rank ON players(rank);
CREATE INDEX idx_players_status ON players(status);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_date ON matches(match_date);

-- Enable Row Level Security (RLS) - for security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (since this is a public pool ladder)
CREATE POLICY "Allow public read access on players" ON players FOR SELECT USING (true);
CREATE POLICY "Allow public insert on players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on players" ON players FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on players" ON players FOR DELETE USING (true);

CREATE POLICY "Allow public read access on matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Allow public insert on matches" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on matches" ON matches FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on matches" ON matches FOR DELETE USING (true);