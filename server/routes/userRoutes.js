import express from 'express';
import User from '../models/User.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

router.get('/users', async (req, res) => {
  try {
    const users = await User.find(); 
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Error fetching users');
  }
});

router.post('/users/add', adminAuth, async (req, res) => {
    const { username, password, role } = req.body;
  
    if (!username || !password || !role) {
      return res.status(400).send('Missing required fields');
    }
  
    try {
      const newUser = new User({ username, password, role });
      await newUser.save();
  
      res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).send('Internal Server Error');
    }
  });


  router.delete('/users/delete/:id', adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findByIdAndDelete(id);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
  });
  

  router.put('/users/edit/:id', adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { username, password, role } = req.body;
  
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (username) user.username = username;
      if (password) user.password = password;
      if (role) user.role = role;
  
      await user.save();
      res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Error updating user', error: error.message });
    }
  });

export default router;
