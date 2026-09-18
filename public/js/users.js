// Debounce helper for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction() {
        var args = arguments;
        var context = this;
        clearTimeout(timeout);
        timeout = setTimeout(function() { func.apply(context, args); }, wait);
    };
}

// ==========================================
// Location Data: Country → State → City
// ==========================================
var locationData = {
    'India': {
        'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Thane'],
        'Delhi': ['New Delhi', 'Delhi'],
        'Karnataka': ['Bangalore', 'Mysore', 'Mangalore', 'Hubli'],
        'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem'],
        'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad'],
        'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri'],
        'Rajasthan': ['Jaipur', 'Udaipur', 'Jodhpur', 'Kota'],
        'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
        'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Noida', 'Ghaziabad'],
        'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior'],
        'Kerala': ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur'],
        'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar'],
        'Haryana': ['Gurgaon', 'Faridabad', 'Panipat', 'Ambala'],
        'Bihar': ['Patna', 'Gaya', 'Muzaffarpur'],
        'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'],
        'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela'],
        'Assam': ['Guwahati', 'Dibrugarh', 'Silchar'],
        'Goa': ['Panaji', 'Margao', 'Vasco da Gama']
    },
    'USA': {
        'New York': ['New York City', 'Buffalo', 'Rochester', 'Albany'],
        'California': ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento'],
        'Illinois': ['Chicago', 'Springfield', 'Peoria'],
        'Texas': ['Houston', 'Dallas', 'Austin', 'San Antonio'],
        'Washington': ['Seattle', 'Spokane', 'Tacoma'],
        'Florida': ['Miami', 'Orlando', 'Tampa', 'Jacksonville'],
        'Massachusetts': ['Boston', 'Cambridge', 'Worcester'],
        'Pennsylvania': ['Philadelphia', 'Pittsburgh', 'Harrisburg'],
        'Georgia': ['Atlanta', 'Savannah', 'Augusta'],
        'Ohio': ['Columbus', 'Cleveland', 'Cincinnati']
    },
    'UK': {
        'England': ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds', 'Bristol'],
        'Scotland': ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee'],
        'Wales': ['Cardiff', 'Swansea', 'Newport'],
        'Northern Ireland': ['Belfast', 'Derry', 'Lisburn']
    },
    'Canada': {
        'Ontario': ['Toronto', 'Ottawa', 'Mississauga', 'Hamilton'],
        'Quebec': ['Montreal', 'Quebec City', 'Laval'],
        'British Columbia': ['Vancouver', 'Victoria', 'Surrey'],
        'Alberta': ['Calgary', 'Edmonton', 'Red Deer']
    },
    'Australia': {
        'New South Wales': ['Sydney', 'Newcastle', 'Wollongong'],
        'Victoria': ['Melbourne', 'Geelong', 'Ballarat'],
        'Queensland': ['Brisbane', 'Gold Coast', 'Cairns'],
        'Western Australia': ['Perth', 'Fremantle']
    }
};

// Country calling codes
var countryCodes = {
    'India': '+91',
    'USA': '+1',
    'UK': '+44',
    'Canada': '+1',
    'Australia': '+61'
};

// Get phone placeholder based on country
var phonePlaceholders = {
    'India': '9876543210',
    'USA': '2125551234',
    'UK': '7911123456',
    'Canada': '4165551234',
    'Australia': '412345678'
};

// Populate a dropdown
function populateDropdown(selectId, options, placeholder) {
    var select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '<option value="">' + placeholder + '</option>';
    options.forEach(function(opt) {
        var option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        select.appendChild(option);
    });
}

// Handle country change → populate states + update phone code
function onCountryChange() {
    var country = document.getElementById('country').value;
    var stateSelect = document.getElementById('state');
    var citySelect = document.getElementById('city');

    // Reset state and city
    stateSelect.innerHTML = '<option value="">-- Select State --</option>';
    citySelect.innerHTML = '<option value="">-- Select City --</option>';

    if (country && locationData[country]) {
        var states = Object.keys(locationData[country]);
        populateDropdown('state', states, '-- Select State --');
    }

    // Update phone country code
    var codeEl = document.getElementById('phone-code');
    var phoneInput = document.getElementById('phone');
    if (codeEl) {
        codeEl.textContent = countryCodes[country] || '+__';
    }
    if (phoneInput && phonePlaceholders[country]) {
        phoneInput.placeholder = phonePlaceholders[country];
    }
}

// Handle state change → populate cities
function onStateChange() {
    var country = document.getElementById('country').value;
    var state = document.getElementById('state').value;
    var citySelect = document.getElementById('city');

    citySelect.innerHTML = '<option value="">-- Select City --</option>';

    if (country && state && locationData[country] && locationData[country][state]) {
        var cities = locationData[country][state];
        populateDropdown('city', cities, '-- Select City --');
    }
}

// ==========================================
// Load Users
// ==========================================
async function loadUsers(searchQuery) {
    searchQuery = searchQuery || '';
    var endpoint = searchQuery ? '/api/users?search=' + encodeURIComponent(searchQuery) : '/api/users';

    var res = await apiCall(endpoint);

    if (res && res.success) {
        renderUsersTable(res.data);
    } else {
        console.warn("Failed to load users:", res);
    }
}

// Render Table
function renderUsersTable(users) {
    var tbody = document.querySelector('#users-table tbody');
    tbody.innerHTML = '';

    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No users found.</td></tr>';
        return;
    }

    users.forEach(function(user, index) {
        var tr = document.createElement('tr');
        var location = [user.city, user.state].filter(Boolean).join(', ') || '-';

        tr.innerHTML =
            '<td>' + (user.id || index + 1) + '</td>' +
            '<td>' + user.first_name + ' ' + user.last_name + '</td>' +
            '<td>' + user.email + '</td>' +
            '<td>' + (user.phone || '-') + '</td>' +
            '<td>' + location + '</td>' +
            '<td>' + (user.country || '-') + '</td>' +
            '<td class="actions-cell">' +
                '<button class="btn btn-sm btn-secondary" onclick="openEditUserModal(' + user.id + ')">Edit</button> ' +
                '<button class="btn btn-sm btn-danger" onclick="deleteUser(' + user.id + ')">Delete</button>' +
            '</td>';
        tbody.appendChild(tr);
    });
}

// Search with debounce
document.addEventListener('DOMContentLoaded', function() {
    var searchInput = document.getElementById('user-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function(e) {
            loadUsers(e.target.value);
        }, 300));
    }
});

// ==========================================
// Build Form HTML with Dropdowns
// ==========================================
function getUserFormHTML() {
    // Build country options
    var countryOptions = '<option value="">-- Select Country --</option>';
    Object.keys(locationData).forEach(function(c) {
        countryOptions += '<option value="' + c + '">' + c + '</option>';
    });

    return '<form id="user-form">' +
        '<input type="hidden" id="user-id">' +
        '<div class="form-row">' +
            '<div class="form-group half">' +
                '<label for="first_name">First Name *</label>' +
                '<input type="text" id="first_name" required placeholder="e.g. Rahul" pattern="^[A-Za-z\\s]{2,50}$" title="Only letters and spaces, 2-50 characters">' +
            '</div>' +
            '<div class="form-group half">' +
                '<label for="last_name">Last Name *</label>' +
                '<input type="text" id="last_name" required placeholder="e.g. Sharma" pattern="^[A-Za-z\\s]{2,50}$" title="Only letters and spaces, 2-50 characters">' +
            '</div>' +
        '</div>' +
        '<div class="form-row">' +
            '<div class="form-group half">' +
                '<label for="email">Email *</label>' +
                '<input type="email" id="email" required placeholder="e.g. rahul@example.com">' +
            '</div>' +
            '<div class="form-group half">' +
                '<label for="country">Country *</label>' +
                '<select id="country" required onchange="onCountryChange()">' + countryOptions + '</select>' +
            '</div>' +
        '</div>' +
        '<div class="form-row">' +
            '<div class="form-group half">' +
                '<label for="state">State *</label>' +
                '<select id="state" required onchange="onStateChange()">' +
                    '<option value="">-- Select State --</option>' +
                '</select>' +
            '</div>' +
            '<div class="form-group half">' +
                '<label for="city">City *</label>' +
                '<select id="city" required>' +
                    '<option value="">-- Select City --</option>' +
                '</select>' +
            '</div>' +
        '</div>' +
        '<div class="form-group">' +
            '<label for="phone">Phone Number *</label>' +
            '<div class="phone-input-group">' +
                '<span class="phone-code" id="phone-code">+__</span>' +
                '<input type="tel" id="phone" required placeholder="Select country first" pattern="^[0-9]{7,12}$" title="Enter digits only" maxlength="15">' +
            '</div>' +
        '</div>' +
        '<p style="font-size:0.82em;color:#64748B;margin-bottom:14px;">* All fields are mandatory</p>' +
        '<div class="modal-actions">' +
            '<button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button> ' +
            '<button type="submit" class="btn btn-primary">Save User</button>' +
        '</div>' +
    '</form>';
}

// ==========================================
// Add User Modal
// ==========================================
function openAddUserModal() {
    openModal('Add New User', getUserFormHTML());
    setTimeout(function() {
        var form = document.getElementById('user-form');
        if (form) {
            form.addEventListener('submit', handleUserSubmit);
        }
    }, 50);
}

// ==========================================
// Edit User Modal (pre-fill dropdowns)
// ==========================================
async function openEditUserModal(id) {
    var res = await apiCall('/api/users/' + id);

    if (res && res.success) {
        var user = res.data;
        openModal('Edit User', getUserFormHTML());

        setTimeout(function() {
            var form = document.getElementById('user-form');
            if (!form) return;

            document.getElementById('user-id').value = user.id;
            document.getElementById('first_name').value = user.first_name || '';
            document.getElementById('last_name').value = user.last_name || '';
            document.getElementById('email').value = user.email || '';
            
            var rawPhone = user.phone || '';
            var code = countryCodes[user.country] || '';
            if (code && rawPhone.startsWith(code)) {
                rawPhone = rawPhone.replace(code, '').trim();
            }
            document.getElementById('phone').value = rawPhone;

            // Pre-fill country
            var countrySelect = document.getElementById('country');
            if (user.country) {
                // If country not in options, append it
                if (![...countrySelect.options].some(function(opt) { return opt.value === user.country; })) {
                    var opt = document.createElement('option');
                    opt.value = user.country;
                    opt.textContent = user.country;
                    countrySelect.appendChild(opt);
                }
                countrySelect.value = user.country;
            }
            onCountryChange();

            // Pre-fill state
            var stateSelect = document.getElementById('state');
            if (user.state) {
                if (![...stateSelect.options].some(function(opt) { return opt.value === user.state; })) {
                    var stateOpt = document.createElement('option');
                    stateOpt.value = user.state;
                    stateOpt.textContent = user.state;
                    stateSelect.appendChild(stateOpt);
                }
                stateSelect.value = user.state;
            }
            onStateChange();

            // Pre-fill city
            var citySelect = document.getElementById('city');
            if (user.city) {
                if (![...citySelect.options].some(function(opt) { return opt.value === user.city; })) {
                    var cityOpt = document.createElement('option');
                    cityOpt.value = user.city;
                    cityOpt.textContent = user.city;
                    citySelect.appendChild(cityOpt);
                }
                citySelect.value = user.city;
            }

            form.addEventListener('submit', handleUserSubmit);
        }, 30);
    } else {
        showToast('Failed to load user details.', 'error');
    }
}

// ==========================================
// Handle Form Submit (Add/Edit)
// ==========================================
async function handleUserSubmit(e) {
    e.preventDefault();

    var submitBtn = e.target.querySelector('button[type="submit"]');
    var originalText = submitBtn ? submitBtn.textContent : 'Save User';

    var id = document.getElementById('user-id').value;
    var userData = {
        first_name: document.getElementById('first_name').value.trim(),
        last_name: document.getElementById('last_name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        country: document.getElementById('country').value
    };

    // --- Validations ---
    var nameRegex = /^[A-Za-z\s]{2,50}$/;
    var emailRegex = /^\S+@\S+\.\S+$/;

    // All fields required
    if (!userData.first_name || !userData.last_name || !userData.email || !userData.phone || !userData.city || !userData.state || !userData.country) {
        showToast('All fields are mandatory. Please fill in every field.', 'error');
        return;
    }

    // Name validation
    if (!nameRegex.test(userData.first_name)) {
        showToast('First Name must contain only letters and spaces (2-50 characters).', 'error');
        return;
    }
    if (!nameRegex.test(userData.last_name)) {
        showToast('Last Name must contain only letters and spaces (2-50 characters).', 'error');
        return;
    }

    // Email validation
    if (!emailRegex.test(userData.email)) {
        showToast('Please enter a valid email address.', 'error');
        return;
    }

    // Country-specific phone validation rules
    var phoneDigits = userData.phone.replace(/[\s-]/g, '');
    var validPhone = false;
    var phoneMsg = 'Please enter a valid phone number.';

    if (userData.country === 'India') {
        validPhone = /^[6-9][0-9]{9}$/.test(phoneDigits);
        phoneMsg = 'India phone number must be 10 digits starting with 6, 7, 8, or 9.';
    } else if (userData.country === 'USA' || userData.country === 'Canada') {
        validPhone = /^[2-9][0-9]{9}$/.test(phoneDigits);
        phoneMsg = (userData.country) + ' phone number must be 10 digits.';
    } else if (userData.country === 'UK') {
        validPhone = /^[1-9][0-9]{8,10}$/.test(phoneDigits);
        phoneMsg = 'UK phone number must be 9 to 11 digits.';
    } else if (userData.country === 'Australia') {
        validPhone = /^[1-9][0-9]{8}$/.test(phoneDigits);
        phoneMsg = 'Australia phone number must be 9 digits.';
    } else {
        validPhone = /^[0-9]{7,15}$/.test(phoneDigits);
    }

    if (!validPhone) {
        showToast(phoneMsg, 'error');
        return;
    }

    // Attach prefix if not already present
    var code = countryCodes[userData.country] || '';
    if (code && !userData.phone.startsWith('+')) {
        userData.phone = code + ' ' + phoneDigits;
    }

    var method = id ? 'PUT' : 'POST';
    var endpoint = id ? '/api/users/' + id : '/api/users';

    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';
        }

        var res = await apiCall(endpoint, {
            method: method,
            body: userData
        });

        if (res && res.success) {
            showToast(id ? 'User updated successfully!' : 'User added successfully!');
            closeModal();
            loadUsers();
        } else {
            showToast(res.message || 'Failed to save user.', 'error');
        }
    } catch (err) {
        showToast(err.message || 'An error occurred.', 'error');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
}

// ==========================================
// Delete User
// ==========================================
function deleteUser(id) {
    openConfirm('Are you sure you want to delete this user? This action cannot be undone.', async function() {
        var res = await apiCall('/api/users/' + id, { method: 'DELETE' });

        if (res && res.success) {
            showToast('User deleted successfully!');
            loadUsers();
        } else {
            showToast(res.message || 'Failed to delete user.', 'error');
        }
    });
}
