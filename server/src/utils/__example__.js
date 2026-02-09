// Example: Using password utilities

import { hashPassword, comparePassword } from './passwordUtils.js';

// Example 1: Hash a password (e.g., during registration)
const hashExample = async () => {
  const plainPassword = 'userPassword123';
  const hashedPassword = await hashPassword(plainPassword);
  console.log('Plain password:', plainPassword);
  console.log('Hashed password:', hashedPassword);
  // Store hashedPassword in database
};

// Example 2: Verify password (e.g., during login)
const compareExample = async () => {
  const plainPassword = 'userPassword123';
  const hashedPassword = '$2b$10$abcdefghijklmnopqrstuvwxyz...'; // From database

  const isMatch = await comparePassword(plainPassword, hashedPassword);
  if (isMatch) {
    console.log('Password is correct');
  } else {
    console.log('Password is incorrect');
  }
};

// Example 3: Using in auth route
const loginRouteExample = async (req, res) => {
  const { email, password } = req.body;

  // 1. Get user from database
  const user = await query('SELECT * FROM users WHERE email = $1', [email]);

  // 2. Verify password
  const isValid = await comparePassword(password, user.rows[0].password);

  // 3. If valid, proceed with login
  if (isValid) {
    res.json({ success: true, user: user.rows[0] });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
};
