const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, lat, lng, mainSkill, servicesProvided, skillsets } = req.body;
        let user = await User.findOne({ where: { email } });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Auto-generate initials from name
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

        user = await User.create({
            name, email, password: hashedPassword, lat, lng, mainSkill, initials,
            servicesProvided: servicesProvided ? JSON.stringify(servicesProvided) : '[]',
            skillsets: skillsets ? JSON.stringify(skillsets) : JSON.stringify({ household: [], professional: [], software: [] })
        });

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'super_secret_skillswap_local_key_123', { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name, email, initials, points: user.points, rating: user.rating, mainSkill: user.mainSkill, servicesProvided: user.servicesProvided ? JSON.parse(user.servicesProvided) : [], skillsets: user.skillsets ? JSON.parse(user.skillsets) : { household: [], professional: [], software: [] } } });
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'super_secret_skillswap_local_key_123', { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name, email, initials: user.initials, points: user.points, rating: user.rating, mainSkill: user.mainSkill, servicesProvided: user.servicesProvided ? JSON.parse(user.servicesProvided) : [], skillsets: user.skillsets ? JSON.parse(user.skillsets) : { household: [], professional: [], software: [] } } });
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
        res.json({ success: true, data: user });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

router.put('/me', auth, async (req, res) => {
    try {
        const { servicesProvided, skillsets, bio, mainSkill } = req.body;
        const user = await User.findByPk(req.user.id);

        if (servicesProvided) user.servicesProvided = JSON.stringify(servicesProvided);
        if (skillsets) user.skillsets = JSON.stringify(skillsets);
        if (bio !== undefined) user.bio = bio;
        if (mainSkill !== undefined) user.mainSkill = mainSkill;

        await user.save();

        res.json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                initials: user.initials,
                points: user.points,
                rating: user.rating,
                mainSkill: user.mainSkill,
                bio: user.bio,
                servicesProvided: user.servicesProvided ? JSON.parse(user.servicesProvided) : [],
                skillsets: user.skillsets ? JSON.parse(user.skillsets) : { household: [], professional: [], software: [] }
            }
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error updating profile');
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // In a real app, send email here. Mocking for now:
        console.log(`\n\n--- FORGOT PASSWORD ---\nEmail sent to: ${email}\nReset Link: ${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}\n-----------------------\n\n`);

        res.json({ message: 'Password reset link sent to your email (check console output in dev).' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error during password reset' });
    }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findOne({
            where: {
                resetPasswordToken: req.params.token,
                resetPasswordExpires: { [Op.gt]: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.json({ message: 'Password has been successfully reset. You can now log in.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error resetting password' });
    }
});

module.exports = router;
