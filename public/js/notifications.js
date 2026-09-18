// Load users into the dropdown for sending notifications
async function loadUserDropdown() {
    var select = document.getElementById('notif-user');
    
    var res = await apiCall('/api/users');
    
    if (res && res.success && res.data) {
        select.innerHTML = '<option value="">Select a user...</option>';
        res.data.forEach(function(user) {
            var option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.first_name + ' ' + user.last_name + ' (' + user.email + ')';
            select.appendChild(option);
        });
    } else {
        select.innerHTML = '<option value="">Failed to load users</option>';
    }
}

// Send a notification
async function sendNotification(e) {
    e.preventDefault();
    
    var submitBtn = e.target.querySelector('button[type="submit"]');
    var originalText = submitBtn ? submitBtn.textContent : 'Send Notification';

    var userId = document.getElementById('notif-user').value;
    var subject = document.getElementById('notif-subject').value;
    var message = document.getElementById('notif-message').value;
    
    if (!userId) {
        showToast('Please select a user.', 'warning');
        return;
    }
    
    if (!subject || !message) {
        showToast('Please fill in subject and message.', 'warning');
        return;
    }
    
    var payload = {
        userId: parseInt(userId, 10),
        subject: subject,
        message: message
    };
    
    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
        }

        var res = await apiCall('/api/notifications/send', {
            method: 'POST',
            body: payload
        });
        
        if (res && res.success) {
            showToast(res.message || 'Notification sent successfully!', 'success');
            
            // Show preview link prominently if available
            if (res.data && res.data.previewUrl) {
                var previewBox = document.getElementById('email-preview-box');
                if (!previewBox) {
                    previewBox = document.createElement('div');
                    previewBox.id = 'email-preview-box';
                    previewBox.style.cssText = 'margin-top:16px;padding:16px;background:#EEF2FF;border:1px solid #C7D2FE;border-radius:8px;text-align:center;';
                    document.getElementById('notification-form').parentNode.appendChild(previewBox);
                }
                previewBox.innerHTML = '<p style="margin:0 0 8px;font-weight:600;color:#4F46E5;">📧 Email sent! View it here:</p>' +
                    '<a href="' + res.data.previewUrl + '" target="_blank" style="color:#4F46E5;font-weight:500;text-decoration:underline;word-break:break-all;">' + res.data.previewUrl + '</a>' +
                    '<p style="margin:8px 0 0;font-size:0.85em;color:#64748B;">Note: Using Ethereal test email. To send real emails, configure Gmail SMTP in .env file.</p>';
            }
            
            // Reset form
            document.getElementById('notification-form').reset();
            
            // Reload history
            loadNotificationHistory();
        } else {
            showToast(res.message || 'Failed to send notification.', 'error');
        }
    } catch (err) {
        showToast(err.message || 'Failed to send notification.', 'error');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
}

// Load notification history
async function loadNotificationHistory() {
    var tbody = document.querySelector('#notifications-history-table tbody');
    
    var res = await apiCall('/api/notifications');
    
    if (res && res.success) {
        tbody.innerHTML = '';
        
        if (!res.data || res.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No notifications found.</td></tr>';
            return;
        }
        
        res.data.forEach(function(notif) {
            var tr = document.createElement('tr');
            var dateStr = new Date(notif.sent_at).toLocaleString();
            var userName = notif.first_name ? (notif.first_name + ' ' + notif.last_name) : ('User ID: ' + notif.user_id);
            var statusColor = notif.status === 'sent' ? 'background:#D1FAE5;color:#065F46;' : 'background:#FEE2E2;color:#991B1B;';
            
            tr.innerHTML = 
                '<td>' + userName + '</td>' +
                '<td>' + notif.subject + '</td>' +
                '<td>' + dateStr + '</td>' +
                '<td><span style="padding:4px 8px;border-radius:12px;' + statusColor + 'font-size:0.85em;">' + (notif.status || 'sent') + '</span></td>';
            tbody.appendChild(tr);
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Failed to load history.</td></tr>';
    }
}
