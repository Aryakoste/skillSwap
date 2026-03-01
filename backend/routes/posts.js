const express = require('express');
const router = express.Router();
const { Post, User } = require('../models');

// Get all posts, ordered by newest
router.get('/', async (req, res) => {
    try {
        const posts = await Post.findAll({
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'initials'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Server error fetching posts' });
    }
});

// Create a new post
router.post('/', async (req, res) => {
    try {
        const { title, content, userId } = req.body;
        if (!userId || !title || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newPost = await Post.create({
            title,
            content,
            userId
        });

        const postWithUser = await Post.findByPk(newPost.id, {
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'initials'] }]
        });

        res.status(201).json(postWithUser);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Server error creating post' });
    }
});

module.exports = router;
