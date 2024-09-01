const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/auth');
const dotenv = require('dotenv');

dotenv.config();

app.use(cors());
app.use(express.json());

// Use the auth routes
app.use('/api/auth', authRoutes);

// Other middlewares and route setups

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
