/**
 * Browser-Based Testing Utilities
 * Lightweight testing without build tools
 * Run tests directly in browser console
 */

/**
 * Simple assertion function
 * @param {boolean} condition - Condition to test
 * @param {string} message - Test description
 */
export function assert(condition, message) {
    if (condition) {
        console.log(`✅ PASS: ${message}`);
        return true;
    } else {
        console.error(`❌ FAIL: ${message}`);
        return false;
    }
}

/**
 * Test suite runner
 * @param {string} suiteName - Name of the test suite
 * @param {Function} tests - Function containing tests
 */
export function describe(suiteName, tests) {
    console.group(`\n🧪 ${suiteName}`);
    const startTime = performance.now();
    
    try {
        tests();
        const endTime = performance.now();
        console.log(`\n⏱️  Completed in ${(endTime - startTime).toFixed(2)}ms`);
    } catch (error) {
        console.error('\n💥 Suite error:', error);
    } finally {
        console.groupEnd();
    }
}

/**
 * Check if element exists in DOM
 * @param {string} selector - CSS selector
 * @returns {boolean}
 */
export function elementExists(selector) {
    return document.querySelector(selector) !== null;
}

/**
 * Check if element is visible
 * @param {string} selector - CSS selector
 * @returns {boolean}
 */
export function elementVisible(selector) {
    const el = document.querySelector(selector);
    if (!el) return false;
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
}

/**
 * Test keyboard navigation
 * @param {string} startSelector - Starting element selector
 * @param {number} tabCount - Number of tabs to simulate
 * @returns {HTMLElement|null} Final focused element
 */
export function testKeyboardNav(startSelector, tabCount = 5) {
    const start = document.querySelector(startSelector);
    if (!start) {
        console.error(`Element not found: ${startSelector}`);
        return null;
    }
    
    start.focus();
    console.log(`Starting at: ${start.tagName}.${start.className}`);
    
    for (let i = 0; i < tabCount; i++) {
        const tab = new KeyboardEvent('keydown', { key: 'Tab', code: 'Tab', keyCode: 9 });
        document.activeElement.dispatchEvent(tab);
        
        // Simulate browser's natural tab behavior
        const focusable = document.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const currentIndex = Array.from(focusable).indexOf(document.activeElement);
        if (currentIndex < focusable.length - 1) {
            focusable[currentIndex + 1].focus();
        }
        
        console.log(`Tab ${i + 1}: ${document.activeElement.tagName}${document.activeElement.className ? '.' + document.activeElement.className : ''}`);
    }
    
    return document.activeElement;
}

/**
 * Run all accessibility checks
 * @returns {Object} Results object
 */
export function checkAccessibility() {
    const results = {
        passed: [],
        failed: [],
        warnings: []
    };
    
    // Check for skip link
    const skipLink = document.querySelector('.skip-to-content, [href="#main-content"]');
    if (skipLink) {
        results.passed.push('Skip-to-content link present');
    } else {
        results.failed.push('Missing skip-to-content link');
    }
    
    // Check for main landmark
    const main = document.querySelector('main, [role="main"]');
    if (main) {
        results.passed.push('Main landmark present');
    } else {
        results.failed.push('Missing main landmark');
    }
    
    // Check for alt text on images
    const images = document.querySelectorAll('img');
    let missingAlt = 0;
    images.forEach(img => {
        if (!img.hasAttribute('alt')) missingAlt++;
    });
    if (missingAlt === 0) {
        results.passed.push('All images have alt attributes');
    } else {
        results.failed.push(`${missingAlt} images missing alt attributes`);
    }
    
    // Check for ARIA labels on buttons without text
    const buttons = document.querySelectorAll('button:empty, button:not(:has(*))');
    let missingLabels = 0;
    buttons.forEach(btn => {
        if (!btn.hasAttribute('aria-label') && !btn.hasAttribute('aria-labelledby')) {
            missingLabels++;
        }
    });
    if (missingLabels === 0) {
        results.passed.push('All buttons properly labeled');
    } else {
        results.warnings.push(`${missingLabels} buttons may need aria-label`);
    }
    
    // Check for heading hierarchy
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const levels = headings.map(h => parseInt(h.tagName[1]));
    let hierarchyOk = true;
    for (let i = 1; i < levels.length; i++) {
        if (levels[i] - levels[i-1] > 1) {
            hierarchyOk = false;
            break;
        }
    }
    if (hierarchyOk) {
        results.passed.push('Heading hierarchy is logical');
    } else {
        results.warnings.push('Heading hierarchy may skip levels');
    }
    
    // Print summary
    console.group('\n♿ Accessibility Check Results');
    console.log(`\n✅ Passed (${results.passed.length}):`);
    results.passed.forEach(p => console.log(`  • ${p}`));
    if (results.warnings.length > 0) {
        console.log(`\n⚠️  Warnings (${results.warnings.length}):`);
        results.warnings.forEach(w => console.warn(`  • ${w}`));
    }
    if (results.failed.length > 0) {
        console.log(`\n❌ Failed (${results.failed.length}):`);
        results.failed.forEach(f => console.error(`  • ${f}`));
    }
    console.groupEnd();
    
    return results;
}

// Example usage:
/*
import { describe, assert, checkAccessibility, testKeyboardNav } from './utils/test.js';

// Run accessibility checks
checkAccessibility();

// Test specific functionality
describe('Admin Panel Data Loading', () => {
    assert(typeof loadAdminData === 'function', 'loadAdminData function exists');
    assert(typeof saveAdminData === 'function', 'saveAdminData function exists');
    assert(typeof adminData === 'object', 'adminData object exists');
});

// Test keyboard navigation
testKeyboardNav('.skip-to-content', 10);
*/
