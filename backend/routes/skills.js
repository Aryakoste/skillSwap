const express = require('express');
const router = express.Router();
const { Skill } = require('../models');

// Get all skills grouped by category
router.get('/', async (req, res) => {
    try {
        const skills = await Skill.findAll({
            order: [['category', 'ASC'], ['name', 'ASC']]
        });

        const groupedSkills = {
            household: [],
            professional: [],
            software: []
        };

        skills.forEach(skill => {
            if (groupedSkills[skill.category]) {
                groupedSkills[skill.category].push(skill.name);
            }
        });

        res.json({ success: true, data: groupedSkills });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error fetching skills');
    }
});

module.exports = router;
