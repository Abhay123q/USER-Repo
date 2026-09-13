const pool = require('../config/db');

const userModel = {
  getAll: async () => {
    const [rows] = await pool.query('SELECT * FROM users ORDER BY id ASC');
    return rows;
  },

  getById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  create: async (userData) => {
    const { first_name, last_name, email, phone, city, state, country } = userData;
    const [result] = await pool.query(
      'INSERT INTO users (first_name, last_name, email, phone, city, state, country) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [first_name, last_name, email, phone, city, state, country]
    );
    return result.insertId;
  },

  update: async (id, userData) => {
    const { first_name, last_name, email, phone, city, state, country } = userData;
    const [result] = await pool.query(
      'UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, city = ?, state = ?, country = ? WHERE id = ?',
      [first_name, last_name, email, phone, city, state, country, id]
    );
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  getByCity: async () => {
    const [rows] = await pool.query('SELECT city, COUNT(*) as count FROM users GROUP BY city ORDER BY count DESC');
    return rows;
  },

  getByState: async () => {
    const [rows] = await pool.query('SELECT state, COUNT(*) as count FROM users GROUP BY state ORDER BY count DESC');
    return rows;
  },

  getByCountry: async () => {
    const [rows] = await pool.query('SELECT country, COUNT(*) as count FROM users GROUP BY country ORDER BY count DESC');
    return rows;
  },

  getSummary: async () => {
    const [totalUsers] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [distinctCities] = await pool.query('SELECT COUNT(DISTINCT city) as count FROM users WHERE city IS NOT NULL');
    const [distinctStates] = await pool.query('SELECT COUNT(DISTINCT state) as count FROM users WHERE state IS NOT NULL');
    const [distinctCountries] = await pool.query('SELECT COUNT(DISTINCT country) as count FROM users WHERE country IS NOT NULL');
    const [recentUsers] = await pool.query('SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)');

    return {
      totalUsers: totalUsers[0].count,
      distinctCities: distinctCities[0].count,
      distinctStates: distinctStates[0].count,
      distinctCountries: distinctCountries[0].count,
      recentUsers: recentUsers[0].count
    };
  },

  searchUsers: async (query) => {
    const searchTerm = `%${query}%`;
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR city LIKE ? OR phone LIKE ?',
      [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]
    );
    return rows;
  }
};

module.exports = userModel;
