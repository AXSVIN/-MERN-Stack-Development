const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const yahooFinance = require('yahoo-finance2').default;

const app = express();
const PORT = 5000;

// ✅ Middlewares
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(bodyParser.json());

// ✅ MongoDB Connection
mongoose.connect('mongodb://localhost:27017/company1', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Mongoose User Model
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// ✅ Routes - User CRUD

// Get all users
app.get('/alldata', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Register user
app.post('/hp', async (req, res) => {
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

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            phone,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});



app.post('/ph', async (req, res) => {
    const { email, phone, password } = req.body;

    if (!email || !phone || !password) {
        return res.status(400).json({ message: 'Please fill all fields' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            phone,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: 'User added successfully' });

    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});





// Update user
app.put('/alldata/:id', async (req, res) => {
    try {
        const updates = { ...req.body };

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete user
app.delete('/alldata/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User Login
app.post('/alldata/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and Password are required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Admin check (Not secure for production)
        if (email === 'ashwin@gmail.com' && password === '123456') {
            return res.status(200).json({ message: 'Login successful', role: 'admin' });
        }

        res.status(200).json({ message: 'Login successful', role: 'user' });

    } catch (err) {
        res.status(500).json({ error: err.message });
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

setInterval(updatePortfolio, 1000);
updatePortfolio();

app.get('/portfolio', (req, res) => {
    res.json(latestResults);
});

// ✅ Start server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
 