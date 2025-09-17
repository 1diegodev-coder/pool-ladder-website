// Main JavaScript for The Pool Ladder Website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeCountdown();
    initializeAnimations();
    initializeMobileMenu();
    initializeJoinForm();
    initializeRealTimeValidation();

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
    // Mobile menu functionality
    window.toggleMobileMenu = function() {
        const mobileNav = document.getElementById('mobileNav');
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');

        if (mobileNav && mobileMenuBtn) {
            const isActive = mobileNav.classList.contains('active');

            // Update ARIA attributes
            mobileMenuBtn.setAttribute('aria-expanded', !isActive);

            if (isActive) {
                mobileNav.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                document.body.style.overflow = '';
            } else {
                mobileNav.classList.add('active');
                mobileMenuBtn.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
    };

    window.closeMobileMenu = function() {
        const mobileNav = document.getElementById('mobileNav');
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');

        if (mobileNav && mobileMenuBtn) {
            mobileNav.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    };

    // Close mobile menu when clicking outside or pressing escape
    document.addEventListener('click', function(e) {
        const mobileNav = document.getElementById('mobileNav');
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');

        if (mobileNav && mobileNav.classList.contains('active')) {
            if (e.target === mobileNav) {
                closeMobileMenu();
            }
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const mobileNav = document.getElementById('mobileNav');
            if (mobileNav && mobileNav.classList.contains('active')) {
                closeMobileMenu();
            }
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMobileMenu();
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
        clearFormErrors();
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

    // Clear previous errors
    clearFormErrors();

    // Get form values
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const experience = formData.get('experience');
    const message = formData.get('message').trim();

    // Validate with real-time feedback
    let hasErrors = false;

    if (!name) {
        showFieldError('name', 'Name is required');
        hasErrors = true;
    } else if (name.length < 2) {
        showFieldError('name', 'Name must be at least 2 characters');
        hasErrors = true;
    }

    if (!email) {
        showFieldError('email', 'Email is required');
        hasErrors = true;
    } else if (!isValidEmail(email)) {
        showFieldError('email', 'Please enter a valid email address');
        hasErrors = true;
    }

    if (!experience) {
        showFieldError('experience', 'Please select your experience level');
        hasErrors = true;
    }

    if (hasErrors) {
        return;
    }

    // Show loading state
    setSubmitLoading(true);
    
    try {
        // Prepare email data
        const emailData = {
            to_email: 'fasteddiespoolleague@proton.me',
            from_name: name,
            from_email: email,
            subject: `Pool Ladder Application - ${name}`,
            message: `
New Pool Ladder Application Received:

Name: ${name}
Email: ${email}
Experience Level: ${experience}${message ? `
Additional Message: ${message}` : ''}

Submitted: ${new Date().toLocaleString()}

This application was submitted through The Pool Ladder website.
Please contact the applicant to proceed with league registration.
            `.trim()
        };
        
        // Try to send email using EmailJS
        const emailSent = await sendEmailViaEmailJS(emailData);
        
        if (emailSent) {
            // Email sent successfully
            showFormStatus('Application submitted successfully! You will be contacted soon about joining the league.', 'success');
            
            // Reset form and close modal after delay
            setTimeout(() => {
                form.reset();
                closeJoinModal();
            }, 3000);
        } else {
            // Fallback to mailto if EmailJS fails
            const subject = `Pool Ladder Application - ${name}`;
            const body = `Name: ${name}
Email: ${email}
Experience Level: ${experience}${message ? `
Message: ${message}` : ''}

This application was submitted through The Pool Ladder website.`;
            
            const mailtoLink = `mailto:fasteddiespoolleague@proton.me?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.location.href = mailtoLink;
            
            showFormStatus('Opening your email client to complete the application. Please send the email that opens.', 'info');
            
            setTimeout(() => {
                closeJoinModal();
            }, 3000);
        }
        
    } catch (error) {
        console.error('Form submission error:', error);
        showFormStatus('There was an error submitting your application. Please try again or contact us directly at fasteddiespoolleague@proton.me', 'error');
    } finally {
        setSubmitLoading(false);
    }
}

// Send email using EmailJS service
async function sendEmailViaEmailJS(emailData) {
    try {
        // EmailJS configuration (you'll need to set these up)
        const SERVICE_ID = 'service_poolladder'; // Replace with your EmailJS service ID
        const TEMPLATE_ID = 'template_poolladder'; // Replace with your EmailJS template ID
        const USER_ID = 'poolladder_public_key'; // Replace with your EmailJS public key
        
        // Check if EmailJS is loaded
        if (typeof emailjs === 'undefined') {
            console.log('EmailJS not loaded, falling back to mailto');
            return false;
        }
        
        // Send email via EmailJS
        const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
            to_email: emailData.to_email,
            from_name: emailData.from_name,
            from_email: emailData.from_email,
            subject: emailData.subject,
            message: emailData.message,
            reply_to: emailData.from_email
        }, USER_ID);
        
        console.log('Email sent successfully:', response);
        return true;
        
    } catch (error) {
        console.log('EmailJS failed, falling back to mailto:', error);
        return false;
    }
}

// Alternative: Send email using Formspree (simpler setup)
async function sendEmailViaFormspree(emailData) {
    try {
        const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID'; // Replace with your Formspree form ID
        
        const response = await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: emailData.from_name,
                email: emailData.from_email,
                subject: emailData.subject,
                message: emailData.message
            })
        });
        
        if (response.ok) {
            console.log('Email sent via Formspree successfully');
            return true;
        } else {
            console.log('Formspree failed:', response.status);
            return false;
        }
        
    } catch (error) {
        console.log('Formspree error:', error);
        return false;
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
    const modal = document.getElementById('joinModal');

    if (!submitBtn) return;

    if (loading) {
        // Add loading class to button
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Add modal loading overlay
        if (modal) {
            let loadingOverlay = modal.querySelector('.modal-loading');
            if (!loadingOverlay) {
                loadingOverlay = document.createElement('div');
                loadingOverlay.className = 'modal-loading';
                loadingOverlay.innerHTML = `
                    <div class="loading-spinner"></div>
                `;
                modal.querySelector('.modal-content').style.position = 'relative';
                modal.querySelector('.modal-content').appendChild(loadingOverlay);
            }
            loadingOverlay.classList.add('active');
        }
    } else {
        // Remove loading class from button
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;

        // Remove modal loading overlay
        if (modal) {
            const loadingOverlay = modal.querySelector('.modal-loading');
            if (loadingOverlay) {
                loadingOverlay.classList.remove('active');
                setTimeout(() => {
                    if (loadingOverlay.parentNode) {
                        loadingOverlay.remove();
                    }
                }, 300);
            }
        }
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

    .form-status.info {
        background: rgba(0, 212, 255, 0.1);
        border: 1px solid var(--electric-cyan);
        color: var(--electric-cyan);
    }

    /* Enhanced Button Loading States */
    .btn.loading {
        position: relative;
        color: transparent !important;
        pointer-events: none;
        overflow: hidden;
    }

    .btn.loading::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 18px;
        height: 18px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .btn-primary.loading::before {
        border-top-color: var(--obsidian-black);
    }

    .btn-outline.loading::before {
        border-top-color: var(--electric-cyan);
    }

    @keyframes spin {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
    }

    /* Form Input Error States */
    .form-input.error,
    .form-textarea.error {
        border-color: var(--crimson-red) !important;
        box-shadow: 0 0 0 2px rgba(220, 20, 60, 0.1) !important;
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }

    /* Success state for inputs */
    .form-input.success,
    .form-textarea.success {
        border-color: var(--neon-green) !important;
        box-shadow: 0 0 0 2px rgba(76, 255, 76, 0.1) !important;
    }

    /* Loading overlay for modal */
    .modal-loading {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(13, 13, 13, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }

    .modal-loading.active {
        opacity: 1;
        visibility: visible;
    }

    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(0, 212, 255, 0.3);
        border-top: 3px solid var(--electric-cyan);
        border-radius: 50%;
        animation: spin 1s linear infinite;
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

// Form validation helper functions
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(fieldName, message) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (field) {
        field.classList.add('error');
        field.style.borderColor = 'var(--crimson-red)';

        // Remove existing error
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) existingError.remove();

        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.cssText = 'color: var(--crimson-red); font-size: 0.8rem; margin-top: 0.25rem; font-weight: 500;';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);

        // Add shake animation
        field.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            field.style.animation = '';
        }, 500);
    }
}

function clearFormErrors() {
    const errorElements = document.querySelectorAll('.field-error');
    errorElements.forEach(el => el.remove());

    const fields = document.querySelectorAll('.form-input, .form-textarea');
    fields.forEach(field => {
        field.classList.remove('error');
        field.style.borderColor = '';
        field.style.animation = '';
    });
}

// Real-time validation listeners
function initializeRealTimeValidation() {
    const form = document.getElementById('joinForm');
    if (!form) return;

    const nameInput = form.querySelector('[name="name"]');
    const emailInput = form.querySelector('[name="email"]');
    const experienceSelect = form.querySelector('[name="experience"]');

    // Name validation
    if (nameInput) {
        nameInput.addEventListener('blur', function() {
            const value = this.value.trim();
            const errorEl = this.parentNode.querySelector('.field-error');

            if (!value) {
                if (!errorEl) showFieldError('name', 'Name is required');
            } else if (value.length < 2) {
                if (!errorEl) showFieldError('name', 'Name must be at least 2 characters');
            } else {
                if (errorEl) {
                    errorEl.remove();
                    this.style.borderColor = '';
                    this.classList.remove('error');
                }
                // Add success state for valid input
                this.classList.add('success');
                setTimeout(() => this.classList.remove('success'), 2000);
            }
        });
    }

    // Email validation
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const value = this.value.trim();
            const errorEl = this.parentNode.querySelector('.field-error');

            if (!value) {
                if (!errorEl) showFieldError('email', 'Email is required');
            } else if (!isValidEmail(value)) {
                if (!errorEl) showFieldError('email', 'Please enter a valid email address');
            } else {
                if (errorEl) {
                    errorEl.remove();
                    this.style.borderColor = '';
                    this.classList.remove('error');
                }
                // Add success state for valid input
                this.classList.add('success');
                setTimeout(() => this.classList.remove('success'), 2000);
            }
        });
    }

    // Experience validation
    if (experienceSelect) {
        experienceSelect.addEventListener('change', function() {
            const errorEl = this.parentNode.querySelector('.field-error');
            if (this.value && errorEl) {
                errorEl.remove();
                this.style.borderColor = '';
                this.classList.remove('error');
            }
        });
    }
}