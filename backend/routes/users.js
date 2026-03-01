const express = require('express');
const router = express.Router();
const { User, Request, ChatGroup, Message } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'initials', 'mainSkill', 'lat', 'lng', 'rating', 'points', 'servicesProvided', 'skillsets']
        });
        res.json(users);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// Get nearby users
router.get('/nearby', auth, async (req, res) => {
    try {
        // Basic logic: return all other users with a random distance for now
        const users = await User.findAll({
            where: {
                id: { [Op.ne]: req.user.id }
            },
            attributes: ['id', 'name', 'initials', 'mainSkill', 'lat', 'lng', 'rating', 'servicesProvided', 'skillsets']
        });

        const data = users.map(u => {
            const plain = u.get({ plain: true });
            plain.distanceKm = Number((Math.random() * 5).toFixed(1));
            return plain;
        });

        res.json({ success: true, data });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});
// Connect with a user
router.post('/:id/connect', auth, async (req, res) => {
    try {
        // Mock connection success
        res.json({ success: true, message: 'Connection request sent successfully!' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// Generate Demo Data
router.post('/demo', async (req, res) => {
    try {
        const password = await bcrypt.hash('password123', 10);

        const { lat, lng } = req.body;
        // Default to Mumbai if not provided
        const centerLat = lat ? parseFloat(lat) : 19.0760;
        const centerLng = lng ? parseFloat(lng) : 72.8777;

        // 1. Create Mock Users centered around the provided coordinates
        const usersToCreate = [
            { name: 'John Doe', email: 'john.demo@test.com', mainSkill: 'Plumbing', lat: centerLat + (Math.random() - 0.5) * 0.1, lng: centerLng + (Math.random() - 0.5) * 0.1, initials: 'JD', servicesProvided: JSON.stringify(['Plumbing', 'Fixing Leaks']), points: 150 },
            { name: 'Jane Smith', email: 'jane.demo@test.com', mainSkill: 'Web Design', lat: centerLat + (Math.random() - 0.5) * 0.1, lng: centerLng + (Math.random() - 0.5) * 0.1, initials: 'JS', servicesProvided: JSON.stringify(['Web Design', 'UI/UX']), points: 300 },
            { name: 'Bob Wilson', email: 'bob.demo@test.com', mainSkill: 'Guitar', lat: centerLat + (Math.random() - 0.5) * 0.1, lng: centerLng + (Math.random() - 0.5) * 0.1, initials: 'BW', servicesProvided: JSON.stringify(['Acoustic Guitar', 'Music Theory']), points: 120 }
        ];

        let createdUsers = [];
        for (let u of usersToCreate) {
            let user = await User.findOne({ where: { email: u.email } });
            if (!user) {
                user = await User.create({ ...u, password });
            }
            createdUsers.push(user);
        }

        // 2. Create Mock Requests
        if (createdUsers.length >= 2) {
            await Request.findOrCreate({
                where: { title: 'Need help fixing my sink' },
                defaults: { description: 'It has been leaking for 3 days.', category: 'Home Services', urgency: 'High', points: 30, userId: createdUsers[1].id, lat: centerLat + 0.01, lng: centerLng + 0.01 }
            });
            await Request.findOrCreate({
                where: { title: 'Need a simple landing page' },
                defaults: { description: 'For my new local bakery business.', category: 'Technology', urgency: 'Medium', points: 100, userId: createdUsers[0].id, lat: centerLat - 0.01, lng: centerLng - 0.01 }
            });
        }

        // 3. Create Mock Groups
        if (createdUsers.length >= 1) {
            const [group] = await ChatGroup.findOrCreate({
                where: { name: 'Local Plumbers' },
                defaults: { description: 'A group for local plumbing services and advice', category: 'Services', createdById: createdUsers[0].id }
            });
            const existingMembers = await group.getMembers();
            const memberIds = existingMembers.map(m => m.id);
            if (!memberIds.includes(createdUsers[0].id)) await group.addMember(createdUsers[0].id);
            if (createdUsers.length >= 2 && !memberIds.includes(createdUsers[1].id)) await group.addMember(createdUsers[1].id);
        }

        res.json({ success: true, message: 'Demo data loaded successfully!' });
    } catch (error) {
        console.error('Demo error:', error);
        res.status(500).json({ error: 'Server Error loading demo data' });
    }
});

module.exports = router;
