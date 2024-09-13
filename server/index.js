const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();
const path = require('path');
const protectedRoutes = require('./routes/protectedRoute');
const authRoutes = require('./routes/auth');
const companyAuthRoutes = require('./routes/companyAuth');
const companyDetailsProfile = require('./routes/companyDetailsProfile');
const consumerProfile = require('./routes/consumerProfile');
const companyServices = require('./routes/companyServices');
const communication = require('./routes/communication');
const companyPublicProfile = require('./routes/companyPublicProfile');
const quotation = require('./routes/quotation');

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
app.use('/api/company', companyDetailsProfile);
app.use('/api/consumer', consumerProfile);
app.use('/api/company-services', companyServices);
app.use('/api/communication', communication);
app.use('/api/companypublic', companyPublicProfile);
app.use('/api/quotation', quotation);
// Other middlewares and route setups

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
