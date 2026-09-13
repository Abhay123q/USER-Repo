// Navigation & Section Management
function showSection(sectionId) {
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(function(link) {
        if (link.dataset.target === sectionId) {
            link.classList.add('active');
            // Update header title - get text without emoji
            var text = link.textContent.trim();
            document.getElementById('section-title').textContent = text.replace(/^[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]\s*/u, '');
        } else {
            link.classList.remove('active');
        }
    });

    // Show target section, hide others
    document.querySelectorAll('.content-section').forEach(function(section) {
        if (section.id === sectionId) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });

    // Trigger section specific logic
    if (sectionId === 'users-section' && typeof loadUsers === 'function') {
        loadUsers();
    } else if (sectionId === 'notifications-section' && typeof loadUserDropdown === 'function') {
        loadUserDropdown();
        loadNotificationHistory();
    } else if (sectionId === 'analytics-section' && typeof loadAnalytics === 'function') {
        loadAnalytics();
    }
}

// Toast System
function showToast(message, type) {
    type = type || 'success';
    var container = document.getElementById('toast-container');
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    
    // Add icon based on type
    var icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';
    
    toast.innerHTML = '<span class="toast-icon">' + icon + '</span>' +
                      '<span class="toast-message">' + message + '</span>';
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(function() { toast.classList.add('show'); }, 10);
    
    // Auto remove
    setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
}

// API Wrapper
async function apiCall(endpoint, options) {
    options = options || {};
    
    var config = {
        method: options.method || 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    // Add body for POST/PUT requests
    if (options.body) {
        if (typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        } else {
            config.body = options.body;
        }
    }

    try {
        var response = await fetch(endpoint, config);
        var data;
        var contentType = response.headers.get('content-type');
        
        if (contentType && contentType.indexOf('application/json') !== -1) {
            data = await response.json();
        } else {
            var text = await response.text();
            data = { success: response.ok, data: text };
        }
        
        if (!response.ok) {
            throw new Error((data && data.message) || 'HTTP error! status: ' + response.status);
        }
        
        return data;
    } catch (error) {
        console.error('API Call Failed:', error);
        showToast(error.message || 'An error occurred during the request.', 'error');
        return { success: false, message: error.message };
    }
}

// Modal Management
function openModal(title, contentHtml) {
    var overlay = document.getElementById('modal-overlay');
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-content').innerHTML = contentHtml;
    overlay.classList.add('show');
}

function closeModal() {
    var overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('show');
    document.getElementById('modal-content').innerHTML = '';
}

// Confirmation Dialog
var confirmCallback = null;

function openConfirm(message, onConfirm) {
    var overlay = document.getElementById('confirm-overlay');
    document.getElementById('confirm-message').textContent = message;
    confirmCallback = onConfirm;
    
    var btn = document.getElementById('confirm-btn');
    btn.onclick = function() {
        if (confirmCallback) confirmCallback();
        closeConfirm();
    };
    
    overlay.classList.add('show');
}

function closeConfirm() {
    document.getElementById('confirm-overlay').classList.remove('show');
    confirmCallback = null;
}

// Initialization
document.addEventListener('DOMContentLoaded', function() {
    // Setup navigation listeners
    document.querySelectorAll('.nav-link').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var target = e.currentTarget.dataset.target;
            if (target) {
                showSection(target);
            }
        });
    });

    // Initial load
    showSection('users-section');

    // Back to Top functionality
    var backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 200) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
