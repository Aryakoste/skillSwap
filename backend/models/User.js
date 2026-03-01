const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    initials: { type: DataTypes.STRING },
    bio: { type: DataTypes.TEXT },
    mainSkill: { type: DataTypes.STRING },
    servicesProvided: {
        type: DataTypes.TEXT, // Stored as JSON string
        defaultValue: '[]'
    },
    skillsets: {
        type: DataTypes.TEXT, // Stored as JSON string { household: [], professional: [], software: [] }
        defaultValue: JSON.stringify({ household: [], professional: [], software: [] })
    },
    skillsOffered: {
        type: DataTypes.TEXT, // Stored as JSON string
        defaultValue: '[]'
    },
    skillsNeeded: {
        type: DataTypes.TEXT, // Stored as JSON string
        defaultValue: '[]'
    },
    points: { type: DataTypes.INTEGER, defaultValue: 100 },
    rating: { type: DataTypes.FLOAT, defaultValue: 5.0 },
    lat: { type: DataTypes.FLOAT },
    lng: { type: DataTypes.FLOAT },
    resetPasswordToken: { type: DataTypes.STRING },
    resetPasswordExpires: { type: DataTypes.DATE }
});

module.exports = User;
