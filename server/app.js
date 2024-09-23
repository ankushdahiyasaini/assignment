import express from 'express';
import connectDB from './config/db.js';
import groupRoutes from './routes/group.js'; 
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); 
app.use(cookieParser());
app.use(cors({
    origin: "http://127.0.0.1:5173",
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  }));
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

connectDB();

// Routes
app.use('/api/groups', groupRoutes);
app.use('/api/user', authRoutes);
app.use('/api/admin', userRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the Group Chat App API');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
