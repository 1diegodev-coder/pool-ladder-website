// Serverless authentication endpoint
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

/**
 * Rate limiting storage for login attempts
 * In-memory Map works for serverless with reasonable cold-start rates
 * For production at scale, consider Vercel KV or Redis
 */
const loginAttempts = new Map();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes in milliseconds
const MAX_ATTEMPTS = 5; // Maximum attempts per window

/**
 * Check and update rate limit for given IP address
 * @param {string} ip - Client IP address
 * @returns {Object} Object with {limited: boolean, message?: string}
 */
function checkRateLimit(ip) {
    const now = Date.now();
    const attempts = loginAttempts.get(ip) || [];
    
    // Remove attempts older than the rate limit window
    const recentAttempts = attempts.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
    
    // Check if rate limit exceeded
    if (recentAttempts.length >= MAX_ATTEMPTS) {
        const oldestAttempt = Math.min(...recentAttempts);
        const timeUntilReset = Math.ceil((oldestAttempt + RATE_LIMIT_WINDOW - now) / 1000 / 60);
        return {
            limited: true,
            message: `Too many login attempts. Please try again in ${timeUntilReset} minute${timeUntilReset !== 1 ? 's' : ''}.`
        };
    }
    
    // Add current attempt and update storage
    recentAttempts.push(now);
    loginAttempts.set(ip, recentAttempts);
    
    // Clean up old entries periodically (simple memory management)
    if (loginAttempts.size > 1000) {
        const entriesToDelete = [];
        for (const [key, value] of loginAttempts.entries()) {
            if (value.every(timestamp => now - timestamp > RATE_LIMIT_WINDOW)) {
                entriesToDelete.push(key);
            }
        }
        entriesToDelete.forEach(key => loginAttempts.delete(key));
    }
    
    return { limited: false };
}

/**
 * Hash password using PBKDF2 with salt
 * @param {string} password - Plain text password
 * @param {string} salt - Cryptographic salt
 * @returns {string} Hex-encoded password hash
 */
function hashPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

async function parseRequestBody(req) {
    // Vercel may provide the parsed body, a JSON string, or nothing at all.
    if (req.body) {
        if (Buffer.isBuffer(req.body)) {
            try {
                return JSON.parse(req.body.toString('utf8'));
            } catch (error) {
                console.error('Login parse error: invalid buffer body');
                return null;
            }
        }

        if (typeof req.body === 'object') {
            return req.body;
        }

        if (typeof req.body === 'string') {
            try {
                return JSON.parse(req.body);
            } catch (error) {
                console.error('Login parse error: invalid JSON string body');
                return null;
            }
        }
    }

    let rawBody = '';
    for await (const chunk of req) {
        rawBody += chunk;
    }

    if (!rawBody) {
        return null;
    }

    try {
        return JSON.parse(rawBody);
    } catch (error) {
        console.error('Login parse error: invalid JSON payload', error);
        return null;
    }
}

export default async function handler(req, res) {
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

    // Get client IP address
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
                     req.headers['x-real-ip'] || 
                     req.connection?.remoteAddress || 
                     'unknown';

    // Check rate limit
    const rateLimitResult = checkRateLimit(clientIp);
    if (rateLimitResult.limited) {
        console.log(`🚫 Rate limit exceeded for IP: ${clientIp}`);
        return res.status(429).json({ 
            error: rateLimitResult.message,
            retryAfter: RATE_LIMIT_WINDOW / 1000 // seconds
        });
    }

    try {
        const body = await parseRequestBody(req);

        if (!body || typeof body !== 'object') {
            return res.status(400).json({ error: 'Invalid request payload' });
        }

        const { password } = body;
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
