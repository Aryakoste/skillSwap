const express = require('express');
const router = express.Router();
const { ChatGroup, User, Message } = require('../models');
const auth = require('../middleware/auth');

// Create a new group
router.post('/', auth, async (req, res) => {
    try {
        const { name, description, category } = req.body;
        const group = await ChatGroup.create({
            name,
            description,
            category,
            createdById: req.user.id
        });

        // Creator automatically joins the group
        await group.addMember(req.user.id);

        res.status(201).json({ success: true, data: group });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error creating group' });
    }
});

// Get all groups
router.get('/', async (req, res) => {
    try {
        const groups = await ChatGroup.findAll({
            include: [{ model: User, as: 'creator', attributes: ['name', 'initials', 'id'] }]
        });
        res.json({ success: true, data: groups });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching groups' });
    }
});

// Join a group
router.post('/:id/join', auth, async (req, res) => {
    try {
        const group = await ChatGroup.findByPk(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found' });

        await group.addMember(req.user.id);
        res.json({ success: true, message: 'Joined group successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error joining group' });
    }
});

// Get group messages
router.get('/:id/messages', auth, async (req, res) => {
    try {
        // You should probably check if user is in group before allowing read
        const messages = await Message.findAll({
            where: { groupId: req.params.id },
            include: [{ model: User, as: 'sender', attributes: ['name', 'initials', 'id'] }],
            order: [['createdAt', 'ASC']]
        });
        res.json({ success: true, data: messages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching group messages' });
    }
});

module.exports = router;
