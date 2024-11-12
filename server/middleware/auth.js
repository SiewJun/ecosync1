const { User } = require('../models');

const authenticateSession = async (req, res, next) => {
  if (req.session && req.session.userId) {
    try {
      const user = await User.findByPk(req.session.userId, {
        attributes: ['id', 'role'], // Fetch only necessary attributes
      });

      if (!user) {
        return res.status(401).json({ message: 'Unauthorized: User not found' });
      }

      req.user = user; // Attach user to the request object
      return next();
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    console.warn(`Unauthorized access attempt on ${req.originalUrl} from IP: ${req.ip}`);
    return res.status(401).json({ message: 'Unauthorized: Please log in to access this resource.' });
  }
};

module.exports = authenticateSession;