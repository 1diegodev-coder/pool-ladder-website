// Serverless authentication endpoint
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Helper function to hash password with salt
function hashPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
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
        // Debug: Re-read environment variables at runtime
        const runtimePasswordHash = process.env.ADMIN_PASSWORD_HASH;
        const runtimeJwtSecret = process.env.JWT_SECRET;

        console.log('🔍 Runtime env check:', {
            hasPasswordHash: !!runtimePasswordHash,
            passwordHashLength: runtimePasswordHash?.length,
            hasJwtSecret: !!runtimeJwtSecret,
            jwtSecretLength: runtimeJwtSecret?.length,
            allEnvKeys: Object.keys(process.env).filter(k => k.includes('ADMIN') || k.includes('JWT'))
        });

        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({ error: 'Password is required' });
        }

        // Use runtime values instead of module-level constants
        if (!runtimePasswordHash || runtimePasswordHash === 'defaulthash') {
            console.error('❌ ADMIN_PASSWORD_HASH not configured');
            return res.status(503).json({
                error: 'Server configuration incomplete',
                details: 'Contact administrator to set up authentication'
            });
        }

        if (!runtimeJwtSecret) {
            console.error('❌ JWT_SECRET not configured');
            return res.status(503).json({
                error: 'Server configuration incomplete',
                details: 'Contact administrator to set up authentication'
            });
        }
        
        const [salt, storedHash] = runtimePasswordHash.split(':');
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
                runtimeJwtSecret,
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
