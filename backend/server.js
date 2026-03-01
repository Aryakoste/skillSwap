require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/skills', require('./routes/skills'));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SkillSwap API running with SQLite' });
});

// Serve frontend in production
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../frontend/build')));

//   app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
//   });
// }

// Setup Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*', // Matches frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join personal room based on userId for private messages
  socket.on('join', (userId) => {
    socket.join(userId);
  });

  // Join a group room
  socket.on('join_group', (groupId) => {
    socket.join(`group_${groupId}`);
    console.log(`User ${socket.id} joined group ${groupId}`);
  });

  // Handle sending and saving direct and group messages
  socket.on('send_message', async (data) => {
    const { senderId, receiverId, groupId, content, fileUrl, fileType, serviceRequestId } = data;
    try {
      const { Message } = require('./models');
      const newMsg = await Message.create({
        senderId,
        receiverId: receiverId || null,
        groupId: groupId || null,
        content: content || null,
        fileUrl: fileUrl || null,
        fileType: fileType || null,
        serviceRequestId: serviceRequestId || null
      });

      // Emit the message
      if (groupId) {
        io.to(`group_${groupId}`).emit('receive_message', newMsg);
      } else if (receiverId) {
        io.to(receiverId).emit('receive_message', newMsg);
        // Emit back to sender
        socket.emit('receive_message', newMsg);
      }
    } catch (error) {
      console.error('Error saving real-time message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Sync Database and Start Server
sequelize.sync({ force: false }).then(async () => {
  console.log('Database synced');

  // Seed Skills if empty
  const { Skill } = require('./models');
  const count = await Skill.count();
  if (count === 0) {
    console.log('Seeding initial skills...');
    const defaultSkills = [
      { category: 'household', name: 'Plumbing' },
      { category: 'household', name: 'Electrician' },
      { category: 'household', name: 'Carpentry' },
      { category: 'household', name: 'Cleaning' },
      { category: 'household', name: 'Cooking' },
      { category: 'household', name: 'Gardening' },
      { category: 'professional', name: 'Accounting' },
      { category: 'professional', name: 'Legal Advice' },
      { category: 'professional', name: 'Business Strategy' },
      { category: 'professional', name: 'Marketing' },
      { category: 'professional', name: 'Copywriting' },
      { category: 'software', name: 'React' },
      { category: 'software', name: 'Node.js' },
      { category: 'software', name: 'Python' },
      { category: 'software', name: 'Excel' },
      { category: 'software', name: 'UI/UX Design' }
    ];
    await Skill.bulkCreate(defaultSkills);
    console.log('Skills seeded successfully');
  }

  server.listen(PORT, () => {
    console.log(`SkillSwap backend running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to sync database:', err);
});
