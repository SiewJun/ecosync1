require('dotenv').config({ path: '../.env' }); // Adjust the path if necessary
const bcrypt = require('bcrypt');
const { User } = require('../models'); // Adjust the path to your models

const createSuperAdmin = async () => {
  try {
    const username = 'superadmin';
    const email = 'siewkhaijun57@gmail.com';
    const password = process.env.SUPERADMIN_PASSWORD;
    const role = 'SUPERADMIN';

    // Check if the password is being read correctly
    if (!password) {
      throw new Error('SUPERADMIN_PASSWORD environment variable is not set');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the superadmin user
    const superAdmin = await User.create({
      cuid: require('cuid')(),
      username,
      email,
      password: hashedPassword,
      role,
    });

    console.log('Superadmin user created:', superAdmin);
  } catch (error) {
    console.error('Error creating superadmin user:', error);
  }
};

createSuperAdmin();