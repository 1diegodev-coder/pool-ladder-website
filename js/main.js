// Main JavaScript for The Pool Ladder Website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeCountdown();
    initializeAnimations();
    initializeMobileMenu();
    initializeJoinForm();
    
    console.log('The Pool Ladder - Website Initialized');
});

// Countdown Timer for Next Match
function initializeCountdown() {
    const countdown = document.getElementById('countdown');
    if (!countdown) return;
    
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    
    // Set target date (2 days from now for demo)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 2);
    targetDate.setHours(20, 0, 0, 0); // 8:00 PM
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate.getTime() - now;
        
        if (distance < 0) {
            // If countdown is over, show "LIVE NOW"
            countdown.innerHTML = '<div class="time-unit"><span class="time-value">LIVE</span><span class="time-label">NOW</span></div>';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        
        if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
        if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
        if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
    }
    
    // Update countdown every minute
    updateCountdown();
    setInterval(updateCountdown, 60000);
}

// Initialize animations and scroll effects
function initializeAnimations() {
    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Fade in animations on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);
    
    // Observe sections for animation
    const sectionsToAnimate = document.querySelectorAll('.standings-preview, .live-action, .stats-dashboard, .recent-results, .cta');
    sectionsToAnimate.forEach(section => {
        observer.observe(section);
    });
}

// Mobile menu functionality
function initializeMobileMenu() {
    const header = document.querySelector('.header');
    const nav = document.querySelector('.nav');
    
    // Create mobile menu button if it doesn't exist
    if (window.innerWidth <= 768 && !document.querySelector('.mobile-menu-btn')) {
        const mobileMenuBtn = document.createElement('button');
        mobileMenuBtn.className = 'mobile-menu-btn';
        mobileMenuBtn.innerHTML = '☰';
        mobileMenuBtn.style.cssText = `
            display: block;
            background: none;
            border: none;
            color: var(--chrome-silver);
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            margin-left: auto;
        `;
        
        // Insert before user actions
        const userActions = document.querySelector('.user-actions');
        if (userActions && userActions.parentNode) {
            userActions.parentNode.insertBefore(mobileMenuBtn, userActions);
        }
        
        // Toggle mobile menu
        mobileMenuBtn.addEventListener('click', function() {
            nav.style.display = nav.style.display === 'block' ? 'none' : 'block';
            this.textContent = nav.style.display === 'block' ? '✕' : '☰';
        });
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        if (window.innerWidth > 768) {
            if (nav) nav.style.display = '';
            if (mobileMenuBtn) mobileMenuBtn.style.display = 'none';
        } else {
            if (mobileMenuBtn) mobileMenuBtn.style.display = 'block';
        }
    });
}

// Join Competition Modal Functions
function openJoinModal() {
    const modal = document.getElementById('joinModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        
        // Focus on first input
        setTimeout(() => {
            const firstInput = modal.querySelector('.form-input');
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

function closeJoinModal() {
    const modal = document.getElementById('joinModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        
        // Reset form
        const form = document.getElementById('joinForm');
        if (form) form.reset();
        hideFormStatus();
    }
}

// Make functions global for onclick handlers
window.openJoinModal = openJoinModal;
window.closeJoinModal = closeJoinModal;

// Initialize join form
function initializeJoinForm() {
    const joinForm = document.getElementById('joinForm');
    if (joinForm) {
        joinForm.addEventListener('submit', handleJoinFormSubmit);
    }
    
    // Close modal when clicking outside
    document.addEventListener('click', function(e) {
        const modal = document.getElementById('joinModal');
        if (e.target === modal) {
            closeJoinModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('joinModal');
            if (modal && modal.classList.contains('active')) {
                closeJoinModal();
            }
        }
    });
}

async function handleJoinFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Get form values
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const experience = formData.get('experience');
    const message = formData.get('message').trim();
    
    // Validate required fields
    if (!name || !email || !experience) {
        showFormStatus('Please fill in all required fields.', 'error');
        return;
    }
    
    // Show loading state
    setSubmitLoading(true);
    
    try {
        // Create email content
        const subject = `Pool Ladder Application - ${name}`;
        const body = `Name: ${name}
Email: ${email}
Experience Level: ${experience}${message ? `
Message: ${message}` : ''}

This application was submitted through The Pool Ladder website.`;
        
        // Create mailto link
        const mailtoLink = `mailto:fasteddiesladderleague@proton.me?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Open mailto link
        window.location.href = mailtoLink;
        
        // Show success message
        showFormStatus('Application submitted! Your email client should open with the application details. Please send the email to complete your application.', 'success');
        
        // Reset form after delay
        setTimeout(() => {
            closeJoinModal();
        }, 3000);
        
    } catch (error) {
        console.error('Form submission error:', error);
        showFormStatus('There was an error submitting your application. Please try again or contact us directly.', 'error');
    } finally {
        setSubmitLoading(false);
    }
}

function showFormStatus(message, type) {
    const statusEl = document.getElementById('joinFormStatus');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = `form-status ${type}`;
        statusEl.style.display = 'block';
    }
}

function hideFormStatus() {
    const statusEl = document.getElementById('joinFormStatus');
    if (statusEl) {
        statusEl.style.display = 'none';
    }
}

function setSubmitLoading(loading) {
    const submitBtn = document.getElementById('joinSubmitBtn');
    if (!submitBtn) return;
    
    const submitText = submitBtn.querySelector('.submit-text');
    const loadingText = submitBtn.querySelector('.submit-loading');
    
    if (loading) {
        if (submitText) submitText.style.display = 'none';
        if (loadingText) loadingText.style.display = 'inline';
        submitBtn.disabled = true;
    } else {
        if (submitText) submitText.style.display = 'inline';
        if (loadingText) loadingText.style.display = 'none';
        submitBtn.disabled = false;
    }
}

// Add styles for the modal and form
const modalStyles = document.createElement('style');
modalStyles.textContent = `
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        justify-content: center;
        align-items: center;
    }

    .modal.active {
        display: flex;
    }

    .modal-content {
        background: linear-gradient(135deg, var(--obsidian-black) 0%, var(--deep-charcoal) 100%);
        border: 2px solid var(--electric-cyan);
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 8px 32px rgba(0, 212, 255, 0.3);
        animation: modalSlideIn 0.3s ease;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid rgba(0, 212, 255, 0.2);
    }

    .modal-header h3 {
        margin: 0;
        color: var(--chrome-silver);
        font-size: 1.25rem;
    }

    .modal-close {
        background: none;
        border: none;
        color: var(--chrome-silver);
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s ease;
    }

    .modal-close:hover {
        background: rgba(220, 20, 60, 0.2);
        color: var(--crimson-red);
    }

    .modal-body {
        padding: 1.5rem;
    }

    .join-intro {
        color: var(--chrome-silver);
        margin-bottom: 1.5rem;
        text-align: center;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        color: var(--chrome-silver);
        font-weight: 500;
    }

    .form-input, .form-textarea {
        width: 100%;
        padding: 0.75rem;
        background: var(--deep-charcoal);
        border: 1px solid rgba(0, 212, 255, 0.3);
        border-radius: 6px;
        color: var(--chrome-silver);
        font-size: 1rem;
        transition: all 0.3s ease;
        box-sizing: border-box;
    }

    .form-input:focus, .form-textarea:focus {
        outline: none;
        border-color: var(--electric-cyan);
        box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.1);
    }

    .form-textarea {
        resize: vertical;
        min-height: 80px;
    }

    .form-status {
        padding: 0.75rem;
        border-radius: 6px;
        margin-top: 1rem;
        font-size: 0.9rem;
    }

    .form-status.success {
        background: rgba(57, 255, 20, 0.1);
        border: 1px solid var(--neon-green);
        color: var(--neon-green);
    }

    .form-status.error {
        background: rgba(220, 20, 60, 0.1);
        border: 1px solid var(--crimson-red);
        color: var(--crimson-red);
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        padding: 1.5rem;
        border-top: 1px solid rgba(0, 212, 255, 0.2);
    }

    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: translateY(-50px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @media (max-width: 768px) {
        .modal-content {
            margin: 1rem;
            width: calc(100% - 2rem);
        }
        
        .modal-header, .modal-body, .modal-footer {
            padding: 1rem;
        }
        
        .modal-footer {
            flex-direction: column;
        }
        
        .modal-footer .btn {
            width: 100%;
        }
    }

    /* Quick Links Section */
    .quick-links {
        padding: 4rem 0;
        background: linear-gradient(135deg, var(--deep-charcoal) 0%, var(--obsidian-black) 100%);
    }

    .links-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 2rem;
        max-width: 900px;
        margin: 0 auto;
    }

    .link-card {
        background: rgba(0, 212, 255, 0.05);
        border: 1px solid rgba(0, 212, 255, 0.2);
        border-radius: 12px;
        padding: 2rem;
        text-decoration: none;
        color: var(--chrome-silver);
        transition: all 0.3s ease;
        display: block;
        text-align: center;
    }

    .link-card:hover {
        transform: translateY(-5px);
        border-color: var(--electric-cyan);
        background: rgba(0, 212, 255, 0.1);
        box-shadow: 0 8px 25px rgba(0, 212, 255, 0.2);
    }

    .link-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.5));
    }

    .link-card h3 {
        color: var(--chrome-silver);
        margin-bottom: 0.5rem;
        font-size: 1.25rem;
    }

    .link-card p {
        color: rgba(192, 192, 192, 0.8);
        font-size: 0.9rem;
        margin: 0;
    }

    @media (max-width: 768px) {
        .links-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }
        
        .link-card {
            padding: 1.5rem;
        }
    }
`;
document.head.appendChild(modalStyles);