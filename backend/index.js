require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Import route handlers
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const commentsRouter = require('./routes/comments'); // or conditionally require if optional
const notificationsRouter = require('./routes/notifications');
const messagesRouter = require('./routes/messages');
const friendRequestsRouter = require('./routes/friendRequests');
const adminAuthRouter = require('./routes/adminAuth');
const adminRouter = require('./routes/admin');

// Middleware

// Configure CORS only once, add your frontend URLs here:
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL  // frontend URL from .env
].filter(Boolean); // filter removes undefined if FRONTEND_URL is empty


app.use(cors({
  origin: function(origin, callback){
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// Parse JSON bodies (replacement for body-parser)
app.use(express.json());

// Serve uploads folder statically for media files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register routes
app.use('/friend-requests', friendRequestsRouter);
app.use('/admin', adminRouter);
app.use('/adminAuth', adminAuthRouter);
app.use('/notifications', notificationsRouter);
app.use('/messages', messagesRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);

// Conditionally use comments route only if defined
if (commentsRouter) {
  app.use('/comments', commentsRouter);
}

// Health check route
app.get('/', (req, res) => {
  res.send('Welcome to Mini LinkedIn API');
});

// Global error handler for CORS or other errors (optional but helpful)
app.use((err, req, res, next) => {
  if (err instanceof Error && err.message.startsWith('The CORS policy')) {
    return res.status(403).json({ message: err.message });
  }

  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
