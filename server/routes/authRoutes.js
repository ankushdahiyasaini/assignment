import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import generateToken from '../utils/authUtils.js'; 
import cookieParser from 'cookie-parser';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();
router.use(cookieParser());

// Define routes
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const user = new User({ username, password, role });
    await user.save();
    res.status(201).send('User registered');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(400).send('Error registering user');
  }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const user = await User.findOne({ username });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).send('Invalid credentials');
      }
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
  
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });
  
      res.status(200).json({ user: user.toJSON(), token });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).send('Error logging in');
    }
  });
  
  

  router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).send('Logged out');
  });

  router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
      } catch (error) {
        res.status(500).json({ message: 'Server error', error });
      }
  });
  
  

export default router;
