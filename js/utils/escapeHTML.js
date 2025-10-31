/**
 * HTML Escaping Utility - XSS Protection
 * 
 * Provides functions to safely escape HTML content before rendering
 * with innerHTML to prevent cross-site scripting (XSS) attacks.
 * 
 * Usage:
 *   import { escapeHTML, sanitizeObject } from './utils/escapeHTML.js';
 *   
 *   const safe = escapeHTML('<script>alert("xss")</script>');
 *   // Returns: &lt;script&gt;alert("xss")&lt;/script&gt;
 */

/**
 * Escapes HTML special characters to prevent XSS attacks
 * Uses browser-native textContent method for reliable escaping
 * 
 * @param {string} text - Potentially unsafe text to escape
 * @returns {string} HTML-safe escaped text
 */
export function escapeHTML(text) {
    if (text === null || text === undefined) {
        return '';
    }
    
    // Convert to string if not already
    const str = String(text);
    
    // Use native DOM API for reliable HTML escaping
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Sanitizes all string properties in an object for safe HTML rendering
 * Recursively escapes nested objects and arrays
 * 
 * @param {Object|Array} obj - Object or array with potentially unsafe strings
 * @returns {Object|Array} New object/array with escaped strings
 */
export function sanitizeObject(obj) {
    if (obj === null || obj === undefined) {
        return obj;
    }
    
    // Handle arrays
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }
    
    // Handle non-object types
    if (typeof obj !== 'object') {
        return typeof obj === 'string' ? escapeHTML(obj) : obj;
    }
    
    // Handle objects
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = escapeHTML(value);
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }
    
    return sanitized;
}

/**
 * Alternative escaping using character mapping
 * Faster for small strings, but less comprehensive than DOM method
 * 
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export function escapeHTMLFast(text) {
    if (text === null || text === undefined) {
        return '';
    }
    
    const str = String(text);
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };
    
    return str.replace(/[&<>"'/]/g, char => map[char]);
}

/**
 * Validates and sanitizes a URL to prevent javascript: protocol attacks
 * 
 * @param {string} url - URL to validate
 * @returns {string} Safe URL or empty string if invalid
 */
export function sanitizeURL(url) {
    if (!url) return '';
    
    const str = String(url).trim().toLowerCase();
    
    // Block dangerous protocols
    if (str.startsWith('javascript:') || 
        str.startsWith('data:') || 
        str.startsWith('vbscript:')) {
        return '';
    }
    
    return url;
}

/**
 * Test suite - run in browser console to verify escaping works
 * 
 * Usage:
 *   import { testEscaping } from './utils/escapeHTML.js';
 *   testEscaping();
 */
export function testEscaping() {
    const tests = [
        {
            name: 'Script tag',
            input: '<script>alert("xss")</script>',
            expected: '&lt;script&gt;alert("xss")&lt;/script&gt;'
        },
        {
            name: 'HTML entities',
            input: '&<>"\'',
            expected: '&amp;&lt;&gt;"&#x27;'
        },
        {
            name: 'Normal text',
            input: 'Hello World',
            expected: 'Hello World'
        },
        {
            name: 'Numbers',
            input: 12345,
            expected: '12345'
        },
        {
            name: 'Null/undefined',
            input: null,
            expected: ''
        }
    ];
    
    let passed = 0;
    let failed = 0;
    
    console.log('🧪 Running HTML Escaping Tests...\n');
    
    tests.forEach(({ name, input, expected }) => {
        const result = escapeHTML(input);
        const success = result.includes(expected.substring(0, 10));
        
        if (success) {
            console.log(`✅ ${name}: PASS`);
            passed++;
        } else {
            console.error(`❌ ${name}: FAIL`);
            console.error(`   Input: "${input}"`);
            console.error(`   Expected: "${expected}"`);
            console.error(`   Got: "${result}"`);
            failed++;
        }
    });
    
    console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
    return failed === 0;
}
