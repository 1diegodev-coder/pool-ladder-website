// Serverless authentication endpoint
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || 'defaulthash';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Helper function to hash password with salt
function hashPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// Helper function to generate salt
function generateSalt() {
    return crypto.randomBytes(32).toString('hex');
}

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({ error: 'Password is required' });
        }
        
        // For initial setup, if no hash is set, create one
        if (ADMIN_PASSWORD_HASH === 'defaulthash') {
            const defaultPassword = 'admin123'; // Change this!
            const salt = generateSalt();
            const hash = hashPassword(defaultPassword, salt);
            console.log('⚠️  Default password setup detected!');
            console.log('⚠️  Set ADMIN_PASSWORD_HASH environment variable to:', `${salt}:${hash}`);
            console.log('⚠️  Default password is: admin123');
            
            // Verify against default password for initial setup
            const providedHash = hashPassword(password, salt);
            if (providedHash === hash) {
                const token = jwt.sign(
                    { 
                        role: 'admin', 
                        timestamp: Date.now(),
                        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress 
                    }, 
                    JWT_SECRET, 
                    { expiresIn: '24h' }
                );
                
                return res.status(200).json({ 
                    success: true, 
                    token,
                    message: 'Login successful (using default setup)',
                    warning: 'Please set up proper environment variables'
                });
            } else {
                return res.status(401).json({ error: 'Invalid password' });
            }
        }
        
        // Production password verification
        const [salt, storedHash] = ADMIN_PASSWORD_HASH.split(':');
        if (!salt || !storedHash) {
            return res.status(500).json({ error: 'Invalid password configuration' });
        }
        
        const providedHash = hashPassword(password, salt);
        
        if (providedHash === storedHash) {
            const token = jwt.sign(
                { 
                    role: 'admin', 
                    timestamp: Date.now(),
                    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress 
                }, 
                JWT_SECRET, 
                { expiresIn: '24h' }
            );
            
            return res.status(200).json({ success: true, token });
        } else {
            // Log failed attempts (in production, consider rate limiting)
            console.log('❌ Failed login attempt from:', req.headers['x-forwarded-for'] || req.connection.remoteAddress);
            return res.status(401).json({ error: 'Invalid password' });
        }
        
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}