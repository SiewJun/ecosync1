const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();
const path = require('path');
const protectedRoutes = require('./routes/protectedRoute');
const authRoutes = require('./routes/auth');
const companyAuthRoutes = require('./routes/companyAuth');

dotenv.config();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to EcoSync API');
});

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use the auth routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', companyAuthRoutes);
app.use('/api', protectedRoutes);

// Other middlewares and route setups

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
