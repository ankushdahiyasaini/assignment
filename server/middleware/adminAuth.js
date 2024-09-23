import User from '../models/User.js';
import { verifyToken } from '../utils/jwtUtils.js';

const adminAuth = async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).send('Access denied');

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user || user.role !== 'admin') return res.status(403).send('Access denied');

    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(403).send(err.message);
  }
};


export default adminAuth;
