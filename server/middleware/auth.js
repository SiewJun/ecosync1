const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET; 

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // Check if the Authorization header exists
  if (!authHeader) {
    console.error('Authorization header missing');
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  // Extract the token from the Authorization header
  const token = authHeader.split(' ')[1];
  if (!token) {
    console.error('Token missing');
    return res.status(401).json({ message: 'Token missing' });
  }

  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Invalid token:', err);
      return res.status(403).json({ message: 'Invalid token' });
    }

    // Attach the decoded user information to the request object
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
