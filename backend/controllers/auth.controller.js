const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const config = require('../config/environment');

exports.register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        // Check if user exists
        const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert user
        const userRole = role || 'user';
        const [result] = await db.query(
            'INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
            [firstName, lastName, email, passwordHash, userRole]
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: { id: result.insertId }
        });
    } catch (err) {
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Get user
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign({ id: user.id, role: user.role }, config.JWT_SECRET, {
            expiresIn: config.JWT_EXPIRES_IN
        });

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.getMe = async (req, res, next) => {
    try {
        const [users] = await db.query('SELECT id, first_name, last_name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
        if (!users.length) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({
            success: true,
            data: users[0]
        });
    } catch (err) {
        next(err);
    }
};
