const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const multer = require('multer');

// TODO: Replace with your actual email credentials later
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'YOUR_EMAIL@gmail.com', // Replace this with your email
    pass: 'YOUR_APP_PASSWORD'     // Replace this with your app password
  }
});

// Helper to send email notification
function sendEmailNotification(subject, text) {
  const mailOptions = {
    from: 'YOUR_EMAIL@gmail.com',
    to: 'YOUR_EMAIL@gmail.com', // Send to yourself
    subject: `[The Loomist] ${subject}`,
    text: text
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email notification (configure your email in server.js):', error.message);
    } else {
      console.log('Email notification sent:', info.response);
    }
  });
}

const app = express();
const PORT = process.env.PORT || 3987;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public'))); // Serve public uploads

// Ensure upload directory exists
const UPLOADS_DIR = path.join(__dirname, 'public', 'images', 'thumbnails');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Sanitize filename spaces
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueSuffix + '-' + safeName);
  }
});
const upload = multer({ storage: storage });

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const VIDEOS_FILE = path.join(DATA_DIR, 'videos.json');
const SUBSCRIBERS_FILE = path.join(DATA_DIR, 'subscribers.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');

// Helpers to read/write JSON
function readJSON(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ========================
//  UPLOAD ROUTE
// ========================
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  
  // The public URL path where the image can be accessed
  const imageUrl = `/images/thumbnails/${req.file.filename}`;
  res.json({ success: true, url: imageUrl });
});

// ========================
//  VIDEO ROUTES
// ========================

// Get all videos (with optional category filter)
app.get('/api/videos', (req, res) => {
  const videos = readJSON(VIDEOS_FILE);
  const { category, featured, search } = req.query;

  let filtered = [...videos];

  if (category && category !== 'all') {
    filtered = filtered.filter(v => v.category === category);
  }

  if (featured === 'true') {
    filtered = filtered.filter(v => v.featured === true);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(v =>
      v.title.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q) ||
      v.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  // Sort by date descending
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json({ success: true, count: filtered.length, data: filtered });
});

// Get single video
app.get('/api/videos/:id', (req, res) => {
  const videos = readJSON(VIDEOS_FILE);
  const video = videos.find(v => v.id === req.params.id);

  if (!video) {
    return res.status(404).json({ success: false, message: 'Video not found' });
  }

  res.json({ success: true, data: video });
});

// Add new video (admin)
app.post('/api/videos', (req, res) => {
  const videos = readJSON(VIDEOS_FILE);
  const { title, description, category, tags, videoUrl, duration, thumbnail } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({ success: false, message: 'Title, description, and category are required' });
  }

  const newVideo = {
    id: 'v' + uuidv4().slice(0, 8),
    title,
    description,
    category,
    tags: tags || [],
    thumbnail: thumbnail || '/images/thumbnails/default.jpg',
    videoUrl: videoUrl || '#',
    duration: duration || '0:00',
    date: new Date().toISOString().split('T')[0],
    featured: req.body.featured || false
  };

  videos.push(newVideo);
  writeJSON(VIDEOS_FILE, videos);

  res.status(201).json({ success: true, data: newVideo });
});

// Update video (admin)
app.put('/api/videos/:id', (req, res) => {
  const videos = readJSON(VIDEOS_FILE);
  const index = videos.findIndex(v => v.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Video not found' });
  }

  videos[index] = { ...videos[index], ...req.body, id: videos[index].id };
  writeJSON(VIDEOS_FILE, videos);

  res.json({ success: true, data: videos[index] });
});

// Delete video (admin)
app.delete('/api/videos/:id', (req, res) => {
  let videos = readJSON(VIDEOS_FILE);
  const index = videos.findIndex(v => v.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Video not found' });
  }

  videos.splice(index, 1);
  writeJSON(VIDEOS_FILE, videos);

  res.json({ success: true, message: 'Video deleted' });
});

// ========================
//  POSTS ROUTES
// ========================

// Get all posts
app.get('/api/posts', (req, res) => {
  const posts = readJSON(POSTS_FILE);
  // Sort by date descending
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json({ success: true, count: posts.length, data: posts });
});

// Add new post (admin)
app.post('/api/posts', (req, res) => {
  const posts = readJSON(POSTS_FILE);
  const { title, imageUrl, content, category } = req.body;

  if (!title || !imageUrl) {
    return res.status(400).json({ success: false, message: 'Title and Image URL are required' });
  }

  const newPost = {
    id: 'p' + uuidv4().slice(0, 8),
    title,
    imageUrl,
    content: content || '',
    category: category || 'Photo',
    date: new Date().toISOString()
  };

  posts.push(newPost);
  writeJSON(POSTS_FILE, posts);

  res.status(201).json({ success: true, data: newPost });
});
// Update post (admin)
app.put('/api/posts/:id', (req, res) => {
  const posts = readJSON(POSTS_FILE);
  const index = posts.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }

  posts[index] = { ...posts[index], ...req.body, id: posts[index].id };
  writeJSON(POSTS_FILE, posts);

  res.json({ success: true, data: posts[index] });
});

// Delete post (admin)
app.delete('/api/posts/:id', (req, res) => {
  let posts = readJSON(POSTS_FILE);
  const index = posts.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }

  posts.splice(index, 1);
  writeJSON(POSTS_FILE, posts);

  res.json({ success: true, message: 'Post deleted' });
});

// ========================
//  SUBSCRIBER ROUTES
// ========================

// Subscribe to newsletter
app.post('/api/subscribe', (req, res) => {
  const subscribers = readJSON(SUBSCRIBERS_FILE);
  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  // Check for duplicate
  if (subscribers.find(s => s.email === email)) {
    return res.status(409).json({ success: false, message: 'Already subscribed!' });
  }

  const newSubscriber = {
    id: uuidv4(),
    email,
    name: name || '',
    subscribedAt: new Date().toISOString()
  };

  subscribers.push(newSubscriber);
  writeJSON(SUBSCRIBERS_FILE, subscribers);

  // Send email notification
  sendEmailNotification('New Newsletter Subscriber', `You have a new subscriber!\n\nEmail: ${email}\nName: ${name || 'N/A'}`);

  res.status(201).json({ success: true, message: 'Successfully subscribed!', data: newSubscriber });
});

// Get subscribers (admin)
app.get('/api/subscribers', (req, res) => {
  const subscribers = readJSON(SUBSCRIBERS_FILE);
  res.json({ success: true, count: subscribers.length, data: subscribers });
});

// ========================
//  CONTACT ROUTES
// ========================

// Submit contact form
app.post('/api/contact', (req, res) => {
  const messages = readJSON(MESSAGES_FILE);
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email, and message are required' });
  }

  const newMessage = {
    id: uuidv4(),
    name,
    email,
    subject: subject || 'No Subject',
    message,
    read: false,
    createdAt: new Date().toISOString()
  };

  messages.push(newMessage);
  writeJSON(MESSAGES_FILE, messages);

  // Send email notification
  sendEmailNotification('New Contact Message', `You received a new message.\n\nFrom: ${name} (${email})\nSubject: ${subject || 'No Subject'}\n\nMessage:\n${message}`);

  res.status(201).json({ success: true, message: 'Message sent successfully!' });
});

// Get messages (admin)
app.get('/api/messages', (req, res) => {
  const messages = readJSON(MESSAGES_FILE);
  res.json({ success: true, count: messages.length, data: messages });
});

// Mark message as read (admin)
app.put('/api/messages/:id/read', (req, res) => {
  const messages = readJSON(MESSAGES_FILE);
  const msg = messages.find(m => m.id === req.params.id);

  if (!msg) {
    return res.status(404).json({ success: false, message: 'Message not found' });
  }

  msg.read = true;
  writeJSON(MESSAGES_FILE, messages);

  res.json({ success: true, data: msg });
});

// ========================
//  STATS (admin dashboard)
// ========================

app.get('/api/stats', (req, res) => {
  const videos = readJSON(VIDEOS_FILE);
  const subscribers = readJSON(SUBSCRIBERS_FILE);
  const messages = readJSON(MESSAGES_FILE);
  const posts = readJSON(POSTS_FILE);

  res.json({
    success: true,
    data: {
      totalVideos: videos.length,
      totalPosts: posts.length,
      totalSubscribers: subscribers.length,
      totalMessages: messages.length,
      unreadMessages: messages.filter(m => !m.read).length,
      videosByCategory: {
        history: videos.filter(v => v.category === 'history').length,
        men: videos.filter(v => v.category === 'men').length,
        women: videos.filter(v => v.category === 'women').length
      }
    }
  });
});

// ========================
//  SERVE FRONTEND
// ========================

// Serve index.html for root and routes (React SPA fallback)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Wildcard fallback for React Router client-side routing
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    res.status(404).json({ success: false, message: 'API endpoint not found' });
  }
});

// Start server
const serverInstance = app.listen(PORT, () => {
  console.log(`\n  ✦ The Loomist Server`);
  console.log(`  ━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  → Website:  http://localhost:${PORT}`);
  console.log(`  → Admin:    http://localhost:${PORT}/admin`);
  console.log(`  → API:      http://localhost:${PORT}/api/videos`);
  console.log(`  ━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});

// Handle server errors gracefully (especially port in use)
serverInstance.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`\n  [Express] Port ${PORT} is already in use.`);
    console.log(`  [Express] Assuming backend server is already running.\n`);
  } else {
    console.error('  [Express] Server error:', err);
  }
});

// Export for Electron
module.exports = serverInstance;
