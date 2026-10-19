
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const connectDB = require('./connectdb/connectDB');

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
connectDB();

// CORS configuration — frontend: localhost:3000
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request body parsers
app.use(bodyParser.json({ limit: '100mb' }));
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: '100mb',
  })
);

// Static uploads
app.use('/upload', express.static(path.join(__dirname, 'upload')));

// Routes
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoute');
const adminRoute = require('./routes/adminRoute');
const userRoutes = require('./routes/userRoute');
const cartRoutes = require('./routes/cartRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const categoryRoutes = require('./routes/categoryRoute');
const paymentRoutes = require('./routes/paymentRoutes');

app.use('/api/admin', adminRoute);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payments', paymentRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
