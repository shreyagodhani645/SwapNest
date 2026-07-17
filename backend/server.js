const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const db = require('./db');
const authRoutes = require('./routes/auth');
const listingsRoutes = require('./routes/listings');
const wishlistRoutes = require('./routes/wishlist');
const chatRoutes = require('./routes/chat');
const offerRoutes = require('./routes/offers');
const userRoutes = require('./routes/users');
const categoriesRoutes = require('./routes/categories');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Socket.io initialization
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Vite
        methods: ['GET', 'POST']
    }
});

// Socket Auth Middleware
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];
        if (!token) return next(new Error('Authentication error'));
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        next();
    } catch (err) {
        next(new Error('Authentication error'));
    }
});

// Socket Handlers
io.on('connection', (socket) => {
    console.log('Socket attached for user:', socket.user.username);

    socket.on('join_room', (data) => {
        const { listingId, otherUserId } = data;
        const myId = socket.user.id;
        const roomName = `chat_${listingId}_${Math.min(myId, otherUserId)}_${Math.max(myId, otherUserId)}`;
        socket.join(roomName);
    });

    socket.on('send_message', async (data) => {
        const { listingId, receiverId, content } = data;
        const senderId = Number(socket.user.id);
        try {
            const sql = `
                INSERT INTO MESSAGES (LISTING_ID, SENDER_ID, RECEIVER_ID, CONTENT)
                VALUES (:listingId, :senderId, :receiverId, :content)
                RETURNING ID, CREATED_AT
            `;
            const binds = {
                listingId: Number(listingId),
                senderId,
                receiverId: Number(receiverId),
                content
            };
            const result = await db.execute(sql, binds);
            const inserted = result.rows[0];

            const newMessage = {
                ID: inserted.ID,
                LISTING_ID: Number(listingId),
                SENDER_ID: senderId,
                RECEIVER_ID: Number(receiverId),
                CONTENT: content,
                CREATED_AT: inserted.CREATED_AT,
                SENDER_NAME: socket.user.username
            };

            const roomName = `chat_${listingId}_${Math.min(senderId, Number(receiverId))}_${Math.max(senderId, Number(receiverId))}`;
            io.to(roomName).emit('receive_message', newMessage);
        } catch (err) {
            console.error('Socket message error:', err);
            socket.emit('message_error', { error: 'Failed to send message' });
        }
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.user.username);
    });
});


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/admin', adminRoutes);

// Database check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Backend is running' });
});

// ===== Admin/Debug: View database tables =====
app.get('/api/admin/tables', async (req, res) => {
    try {
        const result = await db.execute(
            `SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = 'public' ORDER BY TABLE_NAME`,
            {}
        );
        res.json({ tables: result.rows.map(r => r.TABLE_NAME) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// View all rows in a table (for debugging)
app.get('/api/admin/tables/:name', async (req, res) => {
    const tableName = req.params.name.toLowerCase().replace(/[^a-z0-9_]/g, ''); // sanitize
    try {
        const result = await db.execute(`SELECT * FROM ${tableName}`, {});
        res.json({ table: tableName, rowCount: result.rows.length, rows: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== Global Error Handler — catches all unhandled errors =====
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    });
});

async function startServer() {
    await db.initialize();
    server.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

startServer().catch(err => {
    console.error('Failed to start server:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    await db.close();
    process.exit(0);
});