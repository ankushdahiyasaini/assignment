import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
    console.log("Cookies:", req.cookies?.token);
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).send('Access denied. No token provided.');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send('Invalid token or token expired.');
    }
    req.user = user;
    next();
  });
};

export default authenticateToken;
