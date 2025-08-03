const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // 🔒 Add JWT for secure authentication
const yahooFinance = require('yahoo-finance2').default;
require('dotenv').config(); // 🔒 Use environment variables for secrets

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/company1';
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_for_jwt'; // 🔒 Use a strong, random secret key

// ✅ Middlewares
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(bodyParser.json());

// ✅ MongoDB Connection
mongoose.connect(MONGO_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Mongoose User Model
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' } // 🔒 Add a role field
});

userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

const User = mongoose.model('User', userSchema);

// 🔒 Authentication Middleware
const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded.id; // Store user ID from token
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    // 🔒 Fetch user from database to verify role
    User.findById(req.user).then(user => {
        if (user && user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: 'Not authorized as an admin' });
        }
    }).catch(() => {
        res.status(500).json({ message: 'Server error' });
    });
};

// ✅ Routes - User CRUD

// Get all users (Admin only)
app.get('/api/auth/login', protect, admin, async (req, res) => {
    try {
        const users = await User.find().select('-password'); // 🔒 Don't send passwords
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Register user
app.post('/api/auth/register', async (req, res) => {
    const { email, phone, password, confirmPassword } = req.body;

    if (!email || !phone || !password || !confirmPassword) {
        return res.status(400).json({ message: 'Please fill all fields' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = new User({ email, phone, password }); // Password will be hashed by pre-save hook
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// Add user (Admin only, different from register)
// Add user (Admin only)
app.post('/ph', protect, admin, async (req, res) => {
    const { email, phone, password, role } = req.body;

    if (!email || !phone || !password) {
        return res.status(400).json({ message: 'Please fill all fields' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = new User({
            email,
            phone,
            password,
            role: role || 'user'
        });

        await newUser.save();
        res.status(201).json({ message: 'User added successfully' });

    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Update user (Admin only)
app.put('/api/blogs/:id', protect, admin, async (req, res) => {
    try {
        const updates = { ...req.body };
        const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete user (Admin only)
app.delete('/api/blogs/:id', protect, admin, async (req, res) => {
    try {
        const userToDelete = await User.findById(req.params.id);
        if (!userToDelete) {
            return res.status(404).json({ message: 'User not found' });
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // 🔒 Generate a JWT token upon successful login
        const token = jwt.sign({ id: user._id }, JWT_SECRET, {
            expiresIn: '1h'
        });

        res.status(200).json({
            message: 'Login successful',
            token,
            role: user.role
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ✅ Portfolio Section
const stockInputs = [

{ symbol: 'AAPL', qty: 3, purchase_price: 180 },

{ symbol: 'TCS.NS', qty: 2, purchase_price: 3700 },

{ symbol: 'RELIANCE.NS', qty: 5, purchase_price: 2500 },

{ symbol: 'HDFCBANK.NS', qty: 8, purchase_price: 1600 },

{ symbol: 'LT.NS', qty: 4, purchase_price: 3000 },

{ symbol: 'INFY.NS', qty: 6, purchase_price: 1500 },

{ symbol: 'ICICIBANK.NS', qty: 10, purchase_price: 950 },

{ symbol: 'SBIN.NS', qty: 12, purchase_price: 600 },

{ symbol: 'BAJFINANCE.NS', qty: 3, purchase_price: 7000 },

{ symbol: 'HINDUNILVR.NS', qty: 7, purchase_price: 2400 },

{ symbol: 'ITC.NS', qty: 88, purchase_price: 450 },

{ symbol: 'WIPRO.NS', qty: 9, purchase_price: 400 },

{ symbol: 'AXISBANK.NS', qty: 5, purchase_price: 950 },

{ symbol: 'MARUTI.NS', qty: 2, purchase_price: 9200 },

{ symbol: 'HCLTECH.NS', qty: 6, purchase_price: 1100 },

{ symbol: 'NTPC.NS', qty: 20, purchase_price: 280 },

{ symbol: 'JSWSTEEL.NS', qty: 96, purchase_price: 800 },

{ symbol: 'TATASTEEL.NS', qty: 10, purchase_price: 120 },

{ symbol: 'GOOGL', qty: 1, purchase_price: 2800 }
];


// ... (rest of your portfolio code, it looks fine)

let latestResults = [];

async function fetchStockData(symbol, qty, purchase_price) {
    try {
        const quote = await yahooFinance.quoteSummary(symbol, { modules: ['price', 'summaryDetail'] });

        const cmp = quote.price?.regularMarketPrice || 0;
        const peRatio = quote.summaryDetail?.trailingPE || 'N/A';
        const exchange = quote.price?.exchange || 'N/A';

        const total_value = parseFloat((qty * cmp).toFixed(2));
        const total_invested = parseFloat((qty * purchase_price).toFixed(2));
        const profit_or_loss = parseFloat((total_value - total_invested).toFixed(2));

        return {
            symbol,
            exchange,
            cmp,
            pe_ratio: peRatio,
            qty,
            purchase_price,
            total_invested,
            total_value,
            profit_or_loss,
            portfolio_percent: 0
        };
    } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        return null;
    }
}

async function updatePortfolio() {
    stockInputs.forEach(stock => {
        stock.qty = stock.qty >= 100 ? 1 : stock.qty + 1;
    });

    const results = await Promise.all(
        stockInputs.map(stock => fetchStockData(stock.symbol, stock.qty, stock.purchase_price))
    );

    const totalPortfolioValue = results.reduce(
        (acc, stock) => acc + (stock?.total_value || 0),
        0
    );

    results.forEach(stock => {
        if (stock && totalPortfolioValue > 0) {
            stock.portfolio_percent = parseFloat(
                ((stock.total_value / totalPortfolioValue) * 100).toFixed(2)
            );
        }
    });

    latestResults = results;
}

setInterval(updatePortfolio, 15000);
updatePortfolio();

// Portfolio data is public, but you might want to protect it depending on requirements.
app.get('/portfolio', (req, res) => {
    res.json(latestResults);
});

// ✅ Start server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});