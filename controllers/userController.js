const userModel = require('../models/userModel');

/**
 * Get all users, optionally filtered by a search term.
 */
exports.getUsers = async (req, res) => {
    try {
        const searchQuery = req.query.search;
        let users;
        
        if (searchQuery) {
            users = await userModel.searchUsers(searchQuery);
        } else {
            users = await userModel.getAll();
        }
        
        return res.status(200).json({
            success: true,
            data: users,
            message: 'Users retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

// Validation helpers
const nameRegex = /^[A-Za-z\s]{2,50}$/;
const emailRegex = /^\S+@\S+\.\S+$/;
const phoneRegex = /^\+?[0-9]{7,15}$/;

/**
 * Get a single user by ID.
 */
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id) || parseInt(id, 10) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        const user = await userModel.getById(id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        return res.status(200).json({
            success: true,
            data: user,
            message: 'User retrieved successfully'
        });
    } catch (error) {
        console.error(`Error fetching user ${req.params.id}:`, error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

/**
 * Create a new user.
 */
exports.createUser = async (req, res) => {
    try {
        const { first_name, last_name, email, phone, city, state, country } = req.body;
        
        // All fields required
        if (!first_name || !last_name || !email || !phone || !city || !state || !country) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required: first_name, last_name, email, phone, city, state, country'
            });
        }
        
        // Name validation (letters and spaces only, 2-50 chars)
        if (!nameRegex.test(first_name.trim())) {
            return res.status(400).json({ success: false, message: 'First name must contain only letters and spaces (2-50 characters)' });
        }
        if (!nameRegex.test(last_name.trim())) {
            return res.status(400).json({ success: false, message: 'Last name must contain only letters and spaces (2-50 characters)' });
        }
        
        // Email validation
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
        }
        
        // Phone validation (accepts international format with optional +, 7 to 15 digits)
        if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
            return res.status(400).json({ success: false, message: 'Please enter a valid phone number (7-15 digits, digits only)' });
        }
        
        // City, State, Country validation
        if (!nameRegex.test(city.trim())) {
            return res.status(400).json({ success: false, message: 'City must contain only letters and spaces (2-50 characters)' });
        }
        if (!nameRegex.test(state.trim())) {
            return res.status(400).json({ success: false, message: 'State must contain only letters and spaces (2-50 characters)' });
        }
        if (!nameRegex.test(country.trim())) {
            return res.status(400).json({ success: false, message: 'Country must contain only letters and spaces (2-50 characters)' });
        }
        
        const userData = {
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            city: city.trim(),
            state: state.trim(),
            country: country.trim()
        };
        const newUserId = await userModel.create(userData);
        
        return res.status(201).json({
            success: true,
            data: { id: newUserId, ...userData },
            message: 'User created successfully'
        });
    } catch (error) {
        console.error('Error creating user:', error);
        // Handle duplicate email error in MySQL (ER_DUP_ENTRY / 1062) or Postgres (23505)
        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062 || error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'A user with this email address already exists.'
            });
        }
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

/**
 * Update an existing user.
 */
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id) || parseInt(id, 10) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        const updateData = req.body;
        
        // Check if user exists
        const existingUser = await userModel.getById(id);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Merge existing user data with updateData so partial updates don't bind undefined
        const mergedData = {
            first_name: updateData.first_name !== undefined ? String(updateData.first_name).trim() : existingUser.first_name,
            last_name: updateData.last_name !== undefined ? String(updateData.last_name).trim() : existingUser.last_name,
            email: updateData.email !== undefined ? String(updateData.email).trim() : existingUser.email,
            phone: updateData.phone !== undefined ? String(updateData.phone).trim() : existingUser.phone,
            city: updateData.city !== undefined ? String(updateData.city).trim() : existingUser.city,
            state: updateData.state !== undefined ? String(updateData.state).trim() : existingUser.state,
            country: updateData.country !== undefined ? String(updateData.country).trim() : existingUser.country
        };

        // Validations on merged data
        if (!nameRegex.test(mergedData.first_name)) {
            return res.status(400).json({ success: false, message: 'First name must contain only letters and spaces (2-50 characters)' });
        }
        if (!nameRegex.test(mergedData.last_name)) {
            return res.status(400).json({ success: false, message: 'Last name must contain only letters and spaces (2-50 characters)' });
        }
        if (!emailRegex.test(mergedData.email)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
        }
        if (mergedData.phone && !phoneRegex.test(mergedData.phone.replace(/[\s-]/g, ''))) {
            return res.status(400).json({ success: false, message: 'Please enter a valid phone number (7-15 digits)' });
        }
        if (mergedData.city && !nameRegex.test(mergedData.city)) {
            return res.status(400).json({ success: false, message: 'City must contain only letters and spaces (2-50 characters)' });
        }
        if (mergedData.state && !nameRegex.test(mergedData.state)) {
            return res.status(400).json({ success: false, message: 'State must contain only letters and spaces (2-50 characters)' });
        }
        if (mergedData.country && !nameRegex.test(mergedData.country)) {
            return res.status(400).json({ success: false, message: 'Country must contain only letters and spaces (2-50 characters)' });
        }
        
        await userModel.update(id, mergedData);
        
        return res.status(200).json({
            success: true,
            data: { id: parseInt(id, 10), ...mergedData },
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error(`Error updating user ${req.params.id}:`, error);
        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062 || error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'A user with this email address already exists.'
            });
        }
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

/**
 * Delete a user.
 */
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id) || parseInt(id, 10) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }
        
        // Check if user exists
        const existingUser = await userModel.getById(id);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        await userModel.delete(id);
        
        return res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error(`Error deleting user ${req.params.id}:`, error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};
