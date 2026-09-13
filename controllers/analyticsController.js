const userModel = require('../models/userModel');

/**
 * Get overall summary stats.
 */
exports.getSummary = async (req, res) => {
    try {
        const data = await userModel.getSummary();
        return res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Error fetching analytics summary:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Get users grouped by city.
 */
exports.getByCity = async (req, res) => {
    try {
        const data = await userModel.getByCity();
        return res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Error fetching users by city:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Get users grouped by state.
 */
exports.getByState = async (req, res) => {
    try {
        const data = await userModel.getByState();
        return res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Error fetching users by state:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Get users grouped by country.
 */
exports.getByCountry = async (req, res) => {
    try {
        const data = await userModel.getByCountry();
        return res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Error fetching users by country:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
