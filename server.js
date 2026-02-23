const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1); // Required for sessions on Hostinger
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'publishing-super-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/publishingDB';
// Auto-create default admin if none exist
const Admin = require('./models/Admin');
async function initAdmin() {
    try {
        const count = await Admin.countDocuments();
        if (count === 0) {
            const initialAdmin = new Admin({ username: 'admin', password: 'password123' });
            await initialAdmin.save();
            console.log('--- DEFAULT ADMIN CREATED ---');
            console.log('Username: admin');
            console.log('Password: password123');
            console.log('-----------------------------');
        }
    } catch (err) {
        console.error('Failed to init admin:', err);
    }
}

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        initAdmin();
    })
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
const indexRoutes = require('./routes/index');
const adminRoutes = require('./routes/admin');
app.use('/', indexRoutes);
app.use('/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).render('404', { title: '404 - Page Not Found | Infranex Publishers' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
