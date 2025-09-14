// Login Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeLogin();
    checkExistingAuth();
});

// Default credentials (in a real app, this would be server-side)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'poolladder2025'
};

function initializeLogin() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Auto-focus username field
    const usernameField = document.getElementById('username');
    if (usernameField) {
        usernameField.focus();
    }
    
    // Handle Enter key in password field
    const passwordField = document.getElementById('password');
    if (passwordField) {
        passwordField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleLogin(e);
            }
        });
    }
}

function checkExistingAuth() {
    // Check if user is already logged in
    const isAuthenticated = localStorage.getItem('admin_authenticated') === 'true';
    const authTimestamp = localStorage.getItem('admin_auth_timestamp');
    
    if (isAuthenticated && authTimestamp) {
        const now = new Date().getTime();
        const authTime = parseInt(authTimestamp);
        const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
        
        if (now - authTime < sessionDuration) {
            // Still authenticated, redirect to admin
            window.location.href = 'admin.html';
            return;
        } else {
            // Session expired, clear authentication
            clearAuthentication();
        }
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const loginButton = document.querySelector('.btn-login');
    
    // Clear any previous error
    hideError();
    
    // Show loading state
    showLoading(loginButton);
    
    // Simulate network delay for better UX
    setTimeout(() => {
        if (validateCredentials(username, password)) {
            // Successful login
            setAuthentication();
            showSuccess();
            
            // Redirect to admin panel
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);
            
        } else {
            // Failed login
            showError('Invalid username or password. Please try again.');
            hideLoading(loginButton);
            
            // Clear password field
            document.getElementById('password').value = '';
            document.getElementById('password').focus();
        }
    }, 800);
}

function validateCredentials(username, password) {
    return username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password;
}

function setAuthentication() {
    const timestamp = new Date().getTime();
    localStorage.setItem('admin_authenticated', 'true');
    localStorage.setItem('admin_auth_timestamp', timestamp.toString());
    localStorage.setItem('admin_user', ADMIN_CREDENTIALS.username);
}

function clearAuthentication() {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_auth_timestamp');
    localStorage.removeItem('admin_user');
}

function showLoading(button) {
    button.classList.add('loading');
    button.disabled = true;
}

function hideLoading(button) {
    button.classList.remove('loading');
    button.disabled = false;
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    
    // Add shake animation
    errorMessage.style.animation = 'none';
    errorMessage.offsetHeight; // Trigger reflow
    errorMessage.style.animation = 'shake 0.5s ease-in-out';
}

function hideError() {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.style.display = 'none';
}

function showSuccess() {
    const loginButton = document.querySelector('.btn-login');
    hideLoading(loginButton);
    
    loginButton.textContent = '✓ LOGIN SUCCESSFUL';
    loginButton.style.background = 'var(--neon-green)';
    loginButton.style.borderColor = 'var(--neon-green)';
}

// Add CSS animations via JavaScript
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Security: Clear credentials from memory after a delay
setTimeout(() => {
    if (window.ADMIN_CREDENTIALS) {
        window.ADMIN_CREDENTIALS = null;
    }
}, 10000);

// Handle browser back button
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        // Page was loaded from cache, check auth again
        checkExistingAuth();
    }
});