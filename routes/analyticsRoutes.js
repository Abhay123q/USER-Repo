const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// GET /summary - overall summary stats
router.get('/summary', analyticsController.getSummary);

// GET /by-city - users grouped by city
router.get('/by-city', analyticsController.getByCity);

// GET /by-state - users grouped by state
router.get('/by-state', analyticsController.getByState);

// GET /by-country - users grouped by country
router.get('/by-country', analyticsController.getByCountry);

module.exports = router;
