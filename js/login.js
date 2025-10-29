// Login Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeLogin();
    checkExistingAuth();
});

function initializeLogin() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const usernameField = document.getElementById('username');
    if (usernameField) {
        usernameField.focus();
    }
    
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
    const token = localStorage.getItem('admin_jwt_token');
    const expiration = parseInt(localStorage.getItem('admin_jwt_exp') || '0', 10);

    if (token && expiration && Date.now() < expiration) {
        window.location.href = 'admin.html';
        return;
    }

    if (expiration && Date.now() >= expiration) {
        clearAuthentication();
    }
}

async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const loginButton = document.querySelector('.btn-login');

    hideError();
    showLoading(loginButton);

    try {
        if (!password) {
            throw new Error('Password is required.');
        }

        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });

        const rawBody = await response.text();
        let result = null;

        if (rawBody) {
            try {
                result = JSON.parse(rawBody);
            } catch (parseError) {
                console.warn('Login response was not JSON:', parseError);
            }
        }

        if (response.status === 405) {
            throw new Error('Login endpoint is unavailable in this static preview. Start the dev server with `npm run dev` to use admin login.');
        }

        if (!response.ok || !result || !result.token) {
            const fallback = (result && result.error) || rawBody || 'Invalid username or password. Please try again.';
            throw new Error(fallback);
        }

        storeAuthentication(result.token, username || 'admin');
        showSuccess();

        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 800);
    } catch (error) {
        showError(error.message || 'Unable to log in. Please try again.');
        hideLoading(loginButton);
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
    }
}

function storeAuthentication(token, username) {
    const payload = decodeJwt(token);
    const expiration = payload && payload.exp ? payload.exp * 1000 : Date.now() + (24 * 60 * 60 * 1000);

    localStorage.setItem('admin_jwt_token', token);
    localStorage.setItem('admin_jwt_exp', expiration.toString());
    if (username) {
        localStorage.setItem('admin_user', username);
    }
}

function clearAuthentication() {
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_jwt_token');
    localStorage.removeItem('admin_jwt_exp');
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
    if (!errorMessage) {
        console.error('Error message element not found');
        return;
    }
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';

    errorMessage.style.animation = 'none';
    errorMessage.offsetHeight;
    errorMessage.style.animation = 'shake 0.5s ease-in-out';
}

function hideError() {
    const errorMessage = document.getElementById('errorMessage');
    if (!errorMessage) return;
    errorMessage.style.display = 'none';
}

function showSuccess() {
    const loginButton = document.querySelector('.btn-login');
    hideLoading(loginButton);
    
    loginButton.textContent = '✓ LOGIN SUCCESSFUL';
    loginButton.style.background = 'var(--neon-green)';
    loginButton.style.borderColor = 'var(--neon-green)';
}

function decodeJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Failed to decode JWT:', error);
        return null;
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        checkExistingAuth();
    }
});
