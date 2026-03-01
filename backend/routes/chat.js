const express = require('express');
const router = express.Router();
const { Message, User } = require('../models');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Get chat history between two users
router.get('/history/:user1Id/:user2Id', async (req, res) => {
    try {
        const { user1Id, user2Id } = req.params;

        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId: user1Id, receiverId: user2Id },
                    { senderId: user2Id, receiverId: user1Id }
                ]
            },
            order: [['createdAt', 'ASC']]
        });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ error: 'Server error fetching chat history' });
    }
});

// Get users that a user has chatted with
router.get('/contacts/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Find all messages sent or received by userId
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            }
        });

        // Extract unique contact IDs
        const contactIds = new Set();
        messages.forEach(msg => {
            if (msg.senderId !== userId) contactIds.add(msg.senderId);
            if (msg.receiverId !== userId) contactIds.add(msg.receiverId);
        });

        // Fetch user details for those contacts
        const contacts = await User.findAll({
            where: {
                id: Array.from(contactIds)
            },
            attributes: ['id', 'name', 'initials']
        });

        res.json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: 'Server error fetching contacts' });
    }
});

// Upload file for chat message
const auth = require('../middleware/auth');
router.post('/upload', auth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Ensure uploads folder is accessible publicly via express static
        const fileUrl = `/uploads/${req.file.filename}`;

        res.json({
            success: true,
            fileUrl,
            fileType: req.file.mimetype,
            fileName: req.file.originalname
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Server error uploading file' });
    }
});

module.exports = router;
