#!/usr/bin/env node

// Password hash generator for Pool Ladder admin authentication
const crypto = require('crypto');

function generateSalt() {
    return crypto.randomBytes(32).toString('hex');
}

function hashPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function main() {
    const password = process.argv[2];
    
    if (!password) {
        console.log('🔒 Pool Ladder Admin Password Generator');
        console.log('');
        console.log('Usage: node generate-password.js <your-password>');
        console.log('');
        console.log('Example: node generate-password.js mySecurePassword123');
        console.log('');
        process.exit(1);
    }
    
    if (password.length < 8) {
        console.log('❌ Error: Password must be at least 8 characters long');
        process.exit(1);
    }
    
    const salt = generateSalt();
    const hash = hashPassword(password, salt);
    const combined = `${salt}:${hash}`;
    
    console.log('🔒 Pool Ladder Admin Password Generator');
    console.log('');
    console.log('✅ Password hash generated successfully!');
    console.log('');
    console.log('Add this to your environment variables:');
    console.log('');
    console.log(`ADMIN_PASSWORD_HASH=${combined}`);
    console.log('');
    console.log('For Vercel deployment:');
    console.log('1. Go to your Vercel dashboard');
    console.log('2. Select your project');
    console.log('3. Go to Settings > Environment Variables');
    console.log('4. Add ADMIN_PASSWORD_HASH with the value above');
    console.log('');
    console.log('For local development:');
    console.log('1. Create a .env.local file in your project root');
    console.log('2. Add the ADMIN_PASSWORD_HASH line above');
    console.log('');
    console.log('⚠️  Keep this hash secure and never commit it to version control!');
}

main();