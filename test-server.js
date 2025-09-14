#!/usr/bin/env node

// Simple test server for local development
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');

const PORT = 3000;

// Simple JWT implementation for testing
function createSimpleJWT(payload) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const secret = 'test-secret-key';
    
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    
    const signature = crypto
        .createHmac('sha256', secret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64url');
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifySimpleJWT(token) {
    try {
        const [header, payload, signature] = token.split('.');
        const secret = 'test-secret-key';
        
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(`${header}.${payload}`)
            .digest('base64url');
        
        if (signature !== expectedSignature) {
            return null;
        }
        
        const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());
        
        // Check expiration
        if (decodedPayload.exp && Date.now() > decodedPayload.exp * 1000) {
            return null;
        }
        
        return decodedPayload;
    } catch (error) {
        return null;
    }
}

// Password hashing functions
function generateSalt() {
    return crypto.randomBytes(32).toString('hex');
}

function hashPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// Default admin setup
const defaultPassword = 'admin123';
const defaultSalt = generateSalt();
const defaultHash = hashPassword(defaultPassword, defaultSalt);

console.log('🔒 Test Server Admin Credentials:');
console.log('Password:', defaultPassword);
console.log('Salt:', defaultSalt);
console.log('Hash:', defaultHash);
console.log('');

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
};

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return mimeTypes[ext] || 'text/plain';
}

function serveFile(res, filePath) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
            return;
        }
        
        const mimeType = getMimeType(filePath);
        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(data);
    });
}

function handleAPI(req, res, pathname) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }
    
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        try {
            const data = JSON.parse(body || '{}');
            
            if (pathname === '/api/login') {
                handleLogin(res, data);
            } else if (pathname === '/api/verify') {
                handleVerify(res, data, req.headers.authorization);
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'API endpoint not found' }));
            }
        } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
    });
}

function handleLogin(res, data) {
    const { password } = data;
    
    if (!password) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Password is required' }));
        return;
    }
    
    // Verify against default password
    const providedHash = hashPassword(password, defaultSalt);
    
    if (providedHash === defaultHash) {
        const token = createSimpleJWT({
            role: 'admin',
            timestamp: Date.now(),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            token,
            message: 'Login successful (test mode)',
            warning: 'This is a test server. Use proper environment variables in production.'
        }));
    } else {
        console.log('❌ Failed login attempt with password:', password);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid password' }));
    }
}

function handleVerify(res, data, authHeader) {
    const token = data.token || (authHeader && authHeader.replace('Bearer ', ''));
    
    if (!token) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No token provided' }));
        return;
    }
    
    const decoded = verifySimpleJWT(token);
    
    if (!decoded) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid or expired token' }));
        return;
    }
    
    if (decoded.role !== 'admin') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Insufficient permissions' }));
        return;
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        valid: true,
        role: decoded.role,
        timestamp: decoded.timestamp,
        expiresAt: decoded.exp * 1000
    }));
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;
    
    // Handle API routes
    if (pathname.startsWith('/api/')) {
        handleAPI(req, res, pathname);
        return;
    }
    
    // Handle clean URLs
    if (pathname === '/admin') {
        pathname = '/pages/admin.html';
    } else if (pathname === '/ladder') {
        pathname = '/pages/ladder.html';
    } else if (pathname === '/schedule') {
        pathname = '/pages/schedule.html';
    } else if (pathname === '/results') {
        pathname = '/pages/results.html';
    } else if (pathname === '/rules') {
        pathname = '/pages/rules.html';
    } else if (pathname === '/about') {
        pathname = '/pages/about.html';
    } else if (pathname === '/') {
        pathname = '/index.html';
    }
    
    const filePath = path.join(__dirname, pathname);
    
    // Security check - prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }
    
    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Page not found');
            return;
        }
        
        serveFile(res, filePath);
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Test server running at http://localhost:${PORT}`);
    console.log(`📱 Admin panel: http://localhost:${PORT}/admin`);
    console.log(`🔑 Default password: ${defaultPassword}`);
    console.log('');
    console.log('To test:');
    console.log('1. Open http://localhost:3000/admin in your browser');
    console.log('2. Enter password: admin123');
    console.log('3. Test all admin functionality');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Server shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
    });
});