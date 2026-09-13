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
            message: 'Internal server error'
        });
    }
};

/**
 * Get a single user by ID.
 */
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
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
            message: 'Internal server error'
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
        const nameRegex = /^[A-Za-z\s]{2,50}$/;
        if (!nameRegex.test(first_name)) {
            return res.status(400).json({ success: false, message: 'First name must contain only letters and spaces (2-50 characters)' });
        }
        if (!nameRegex.test(last_name)) {
            return res.status(400).json({ success: false, message: 'Last name must contain only letters and spaces (2-50 characters)' });
        }
        
        // Email validation
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
        }
        
        // Phone validation (accepts international format with optional +, 7 to 15 digits)
        const phoneRegex = /^\+?[0-9]{7,15}$/;
        if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
            return res.status(400).json({ success: false, message: 'Please enter a valid phone number (7-15 digits, digits only)' });
        }
        
        // City, State, Country validation
        if (!nameRegex.test(city)) {
            return res.status(400).json({ success: false, message: 'City must contain only letters and spaces (2-50 characters)' });
        }
        if (!nameRegex.test(state)) {
            return res.status(400).json({ success: false, message: 'State must contain only letters and spaces (2-50 characters)' });
        }
        if (!nameRegex.test(country)) {
            return res.status(400).json({ success: false, message: 'Country must contain only letters and spaces (2-50 characters)' });
        }
        
        const userData = { first_name, last_name, email, phone, city, state, country };
        const newUserId = await userModel.create(userData);
        
        return res.status(201).json({
            success: true,
            data: { id: newUserId, ...userData },
            message: 'User created successfully'
        });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Update an existing user.
 */
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // Check if user exists
        const existingUser = await userModel.getById(id);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Basic validation on required fields if they are provided
        if ((updateData.first_name !== undefined && !updateData.first_name) ||
            (updateData.last_name !== undefined && !updateData.last_name) ||
            (updateData.email !== undefined && !updateData.email)) {
            return res.status(400).json({
                success: false,
                message: 'first_name, last_name, and email cannot be empty if provided'
            });
        }
        
        await userModel.update(id, updateData);
        
        return res.status(200).json({
            success: true,
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error(`Error updating user ${req.params.id}:`, error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Delete a user.
 */
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
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
            message: 'Internal server error'
        });
    }
};
