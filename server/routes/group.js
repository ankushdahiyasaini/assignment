import express from 'express';
import Group from '../models/Group.js';
import Message from '../models/Message.js';
import adminAuth  from '../middleware/adminAuth.js';
import authenticateToken from '../middleware/auth.js'

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
    const userId = req.user.id;

    try {
        const groups = await Group.find({
            $or: [
                { members: userId },
                { admins: userId }
            ]
        });

        res.status(200).json(groups);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

  router.post('/create', authenticateToken, async (req, res) => {
    const { name, members } = req.body;
  
    if (!req.user || !req.user.id) {
      return res.status(403).json({ message: 'Access denied. User ID not found.' });
    }
  
    const createdBy = req.user.id;
  
    try {
      const group = new Group({ name, members, admins: [createdBy], createdBy });
      await group.save();
      res.status(201).json({ message: 'Group created', group });
    } catch (error) {
      res.status(500).json({ message: 'Error creating group', error });
    }
  });
  
  
  router.get('/:groupId/details', async (req, res) => {
    const { groupId } = req.params;
    try {
      const group = await Group.findById(groupId)
        .populate('members')
        .populate('admins');
  
      if (!group) return res.status(404).json({ message: 'Group not found' });

      res.status(200).json({
        group: {
          id: group._id,
          name: group.name,
          admins: group.admins,
          members: group.members,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching group information', error });
    }
  });
  


// Add member to a group
router.post('/:groupId/members/add', async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
      res.status(200).json({ message: 'Member added', group });
    } else {
      res.status(400).json({ message: 'User is already a member' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error adding member', error });
  }
});

// Remove member from a group
router.delete('/:groupId/members/:userId', async (req, res) => {
    const { groupId, userId } = req.params;

    try {
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
      if (group.admins.includes(req.user.id) || userId.toString() === req.user.id) {
        group.members = group.members.filter(member => member.toString() !== userId);
        await group.save();
        res.status(200).json({ message: 'Member removed', group });
      } else {
        return res.status(403).json({ message: 'Unauthorized to remove this member' });
      }
    } catch (error) {
      console.error('Error removing member:', error);
      res.status(500).json({ message: 'Error removing member', error });
    }
});

// Assign admin to a group
router.post('/:groupId/assign-admin', adminAuth, async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (!group.admins.includes(userId)) {
      group.admins.push(userId);
      await group.save();
      res.status(200).json({ message: 'Admin assigned', group });
    } else {
      res.status(400).json({ message: 'User is already an admin' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error assigning admin', error });
  }
});

// Remove admin from a group
router.delete('/:groupId/remove-admin/:userId', adminAuth, async (req, res) => {
  const { groupId, userId } = req.params;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    group.admins = group.admins.filter((admin) => admin.toString() !== userId);
    await group.save();
    res.status(200).json({ message: 'Admin removed', group });
  } catch (error) {
    res.status(500).json({ message: 'Error removing admin', error });
  }
});

// Delete a group
router.delete('/:id', adminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    await Group.findByIdAndDelete(id);
    res.status(200).json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting group', error });
  }
});


//Messages Routes Here

// Create a new message
router.post('/:groupId/messages', async (req, res) => {
    const { text } = req.body;
    const { groupId } = req.params;
    const senderId = req.user.id; // Ensure req.user is defined
    
    try {
        const newMessage = new Message({
            text,
            sender: senderId,
            group: groupId,
        });

        await newMessage.save();
        const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'username');

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

  // Get messages for a specific group
router.get('/:groupId/messages', async (req, res) => {
    const { groupId } = req.params;
  
    try {
      const messages = await Message.find({ group: groupId })
        .populate('sender', 'username')
        .sort({ createdAt: -1 }); 
  
      res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.post('/:groupId/messages/:messageId/like', async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user.id;
  
    try {
      const message = await Message.findById(messageId);
  
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
      const isLiked = message.likes.includes(userId);
      if (!isLiked) {
        message.likes.push(userId);
        message.likeCount += 1;
      } else {
        message.likes.pull(userId);
        message.likeCount -= 1;
      }
      await message.save();
  
      return res.status(200).json({ likes: message.likeCount });
    } catch (error) {
      console.error('Error liking message:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  });
  


  // Unlike a message
router.post('/:groupId/messages/:messageId/unlike', async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user.id;
  
    try {
      const message = await Message.findById(messageId);
  
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
  
      if (message.likes.includes(userId)) {
        message.likes = message.likes.filter(id => id.toString() !== userId);
        await message.save();
        res.status(200).json(message);
      } else {
        res.status(400).json({ message: 'You have not liked this message' });
      }
    } catch (error) {
      console.error('Error unliking message:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

export default router;
