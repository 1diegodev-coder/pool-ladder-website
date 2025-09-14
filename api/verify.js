// Token verification endpoint
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const authHeader = req.headers.authorization;
        const token = req.body.token || (authHeader && authHeader.replace('Bearer ', ''));
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Check if token is for admin role
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        
        // Token is valid
        return res.status(200).json({ 
            valid: true, 
            role: decoded.role,
            timestamp: decoded.timestamp,
            expiresAt: decoded.exp * 1000 // Convert to milliseconds
        });
        
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        } else {
            console.error('Token verification error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}