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
        if (err.errorNum === 1) { // Unique constraint violation in Oracle
            return res.status(400).json({ message: 'Username or Email already exists' });
        }
        if (err.code === 'NJS-503' || err.message.includes('ECONNREFUSED')) {
            return res.status(503).json({ message: 'Database is offline. Please ensure Oracle DB is running.' });
        }
        res.status(500).json({ message: 'Error registering user', error: err.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const sql = `SELECT ID, USERNAME, EMAIL, PASSWORD FROM USERS WHERE EMAIL = :email`;
        const result = await db.execute(sql, { email }, { outFormat: require('oracledb').OUT_FORMAT_OBJECT });

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.PASSWORD);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.ID, username: user.USERNAME, email: user.EMAIL },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.ID, username: user.USERNAME, email: user.EMAIL }
        });
    } catch (err) {
        if (err.code === 'NJS-503' || err.message.includes('ECONNREFUSED')) {
            return res.status(503).json({ message: 'Database is offline. Please ensure Oracle DB is running.' });
        }
        res.status(500).json({ message: 'Error logging in', error: err.message });
    }
};

module.exports = { signup, login };
