const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Example route
app.get('/', (req, res) => {
  res.send('Welcome to the Green Energy Marketplace API');
});

module.exports = app;
