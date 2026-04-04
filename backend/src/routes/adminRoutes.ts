import express, { Response } from 'express';
import User from '../models/User';
import { protect, admin, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();

// Get all users
router.get('/users', protect, admin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update user status (Whitelist / Blacklist)
router.put('/users/:id/status', protect, admin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.status = req.body.status || user.status;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        status: updatedUser.status,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Add new Admin
router.post('/add-admin', protect, admin, async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, name, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      userExists.isAdmin = true;
      userExists.status = 'whitelisted';
      await userExists.save();
      res.json({ message: 'Existing user upgraded to Admin', user: userExists });
      return;
    }

    const newUser = await User.create({
      name,
      email,
      password: password || 'AdminPassword123!',
      isAdmin: true,
      status: 'whitelisted',
    });

    res.status(201).json({ message: 'New admin created', user: newUser });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// NEW: Add normal User (Auto-Whitelisted)
router.post('/add-user', protect, admin, async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, name, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }

    const newUser = await User.create({
      name,
      email,
      password: password || 'UserPassword123!',
      isAdmin: false, // Explicitly false
      status: 'whitelisted', // Auto-whitelist because Admin created them
    });

    res.status(201).json({ message: 'New user created and whitelisted', user: newUser });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});
// Delete User permanently
router.delete('/users/:id', protect, admin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.isAdmin) {
        res.status(400).json({ message: 'Cannot delete an admin user directly.' });
        return;
      }
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: 'User completely deleted' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});
export default router;