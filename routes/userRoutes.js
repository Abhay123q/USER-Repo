const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET / - list all users (supports ?search=)
router.get('/', userController.getUsers);

// GET /:id - get single user
router.get('/:id', userController.getUserById);

// POST / - create user
router.post('/', userController.createUser);

// PUT /:id - update user
router.put('/:id', userController.updateUser);

// DELETE /:id - delete user
router.delete('/:id', userController.deleteUser);

module.exports = router;
