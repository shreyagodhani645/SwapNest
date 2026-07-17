const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

const signup = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO USERS (USERNAME, EMAIL, PASSWORD) VALUES (:username, :email, :password)`;
        await db.execute(sql, { username, email, password: hashedPassword });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        // Postgres unique violation error code (was Oracle's err.errorNum === 1)
        if (err.code === '23505') {
            return res.status(400).json({ message: 'Username or Email already exists' });
        }
        if (err.message && err.message.includes('ECONNREFUSED')) {
            return res.status(503).json({ message: 'Database is offline. Please check your connection.' });
        }
        res.status(500).json({ message: 'Error registering user', error: err.message });
    }
};

const login = async (req, res) => {
    // Accepts either "identifier" (email or username, from the updated Login form)
    // or a plain "email" field for backwards compatibility with any other callers.
    const identifier = req.body.identifier || req.body.email;
    const { password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({ message: 'Email/username and password are required' });
    }

    try {
        const sql = `
            SELECT ID, USERNAME, EMAIL, PASSWORD, PHONE, PROFILE_PICTURE, ROLE, IS_BANNED 
            FROM USERS 
            WHERE EMAIL = :identifier OR USERNAME = :identifier
        `;
        const result = await db.execute(sql, { identifier });

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Account does not exist, please sign up' });
        }

        const user = result.rows[0];

        // Check if user is banned
        if (user.IS_BANNED === 1) {
            return res.status(403).json({ message: 'Your account has been banned. Contact admin for support.' });
        }

        const isMatch = await bcrypt.compare(password, user.PASSWORD);

        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect credentials (wrong password)' });
        }

        const token = jwt.sign(
            { id: user.ID, username: user.USERNAME, email: user.EMAIL, role: user.ROLE || 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.ID, username: user.USERNAME, email: user.EMAIL, phone: user.PHONE || '', PROFILE_PICTURE: user.PROFILE_PICTURE || '', role: user.ROLE || 'user' }
        });
    } catch (err) {
        if (err.message && err.message.includes('ECONNREFUSED')) {
            return res.status(503).json({ message: 'Database is offline. Please check your connection.' });
        }
        res.status(500).json({ message: 'Error logging in', error: err.message });
    }
};

module.exports = { signup, login };