const express = require('express');
const router = express.Router();
const { Request, User } = require('../models');
const auth = require('../middleware/auth');

// Get all requests
router.get('/', async (req, res) => {
    try {
        const requests = await Request.findAll({
            include: [
                { model: User, as: 'user', attributes: ['name', 'initials', 'id'] },
                { model: User, as: 'acceptedBy', attributes: ['name', 'initials', 'id'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        // Add dummy distanceKm for now, will enhance later
        const data = requests.map(r => {
            const plain = r.get({ plain: true });
            plain.distanceKm = Number((Math.random() * 5).toFixed(1));
            return plain;
        });
        res.json({ success: true, data });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// Create a request
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, category, urgency, points } = req.body;

        const user = await User.findByPk(req.user.id);

        const newReq = await Request.create({
            title,
            description,
            category,
            urgency: urgency || 'Medium',
            points: points || 10,
            userId: req.user.id,
            lat: user.lat,
            lng: user.lng
        });

        const populatedReq = await Request.findByPk(newReq.id, {
            include: [{ model: User, as: 'user', attributes: ['name', 'initials', 'id'] }]
        });

        res.status(201).json({ success: true, data: populatedReq });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// Accept a request
router.post('/:id/accept', auth, async (req, res) => {
    try {
        const request = await Request.findByPk(req.params.id);
        if (!request) return res.status(404).json({ message: 'Request not found' });
        if (request.status !== 'Open') return res.status(400).json({ message: 'Request is no longer open' });
        if (request.userId === req.user.id) return res.status(400).json({ message: 'Cannot accept your own request' });

        request.status = 'Accepted';
        request.acceptedById = req.user.id;
        await request.save();

        const updatedReq = await Request.findByPk(request.id, {
            include: [
                { model: User, as: 'user', attributes: ['name', 'initials', 'id'] },
                { model: User, as: 'acceptedBy', attributes: ['name', 'initials', 'id'] }
            ]
        });

        res.json({ success: true, data: updatedReq });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// Complete a request
router.post('/:id/complete', auth, async (req, res) => {
    try {
        const request = await Request.findByPk(req.params.id);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        // Only the creator can mark it as done
        if (request.userId !== req.user.id) return res.status(401).json({ message: 'Unauthorized' });
        if (request.status !== 'Accepted') return res.status(400).json({ message: 'Request must be accepted first' });

        request.status = 'Completed';
        await request.save();

        // Award points to the user who accepted
        const worker = await User.findByPk(request.acceptedById);
        if (worker) {
            worker.points += request.points;
            await worker.save();
        }

        const updatedReq = await Request.findByPk(request.id, {
            include: [
                { model: User, as: 'user', attributes: ['name', 'initials', 'id'] },
                { model: User, as: 'acceptedBy', attributes: ['name', 'initials', 'id'] }
            ]
        });

        res.json({ success: true, data: updatedReq });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});
// Offer help for a request
router.post('/:id/offer', auth, async (req, res) => {
    try {
        // Mock offer success
        res.json({ success: true, message: 'Help offer sent successfully!' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
