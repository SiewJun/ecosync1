const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();
const path = require('path');
const authRoutes = require('./routes/auth');
const companyAuthRoutes = require('./routes/companyAuth');
const companyDetailsProfile = require('./routes/companyDetailsProfile');
const consumerProfile = require('./routes/consumerProfile');
const companyServices = require('./routes/companyServices');
const communication = require('./routes/communication');
const companyPublicProfile = require('./routes/companyPublicProfile');
const quotation = require('./routes/quotation');
const getEstimate = require('./routes/getEstimate');
const project = require('./routes/project');
const projectStep = require('./routes/projectStep');  
const stripe = require('./routes/stripe');
const adminModeration = require('./routes/adminModeration');

dotenv.config();

// Stripe webhook route should be defined before any middleware that parses the request body
app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), stripe);

// Apply other middleware for all other routes
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to EcoSync API');
});

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/auth', companyAuthRoutes);
app.use('/api/company', companyDetailsProfile);
app.use('/api/consumer', consumerProfile);
app.use('/api/company-services', companyServices);
app.use('/api/communication', communication);
app.use('/api/companypublic', companyPublicProfile);
app.use('/api/quotation', quotation);
app.use('/api/get-estimate', getEstimate);
app.use('/api/project', project);
app.use('/api/project-step', projectStep);
app.use('/api/stripe', stripe);
app.use('/api/admin-moderation', adminModeration);

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});