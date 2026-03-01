const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Request = sequelize.define('Request', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    urgency: { type: DataTypes.STRING, defaultValue: 'Medium' }, // Low | Medium | High | Emergency
    points: { type: DataTypes.INTEGER, defaultValue: 10 },
    status: { type: DataTypes.STRING, defaultValue: 'Open' }, // Open | Accepted | Completed
    acceptedById: {
        type: DataTypes.UUID,
        allowNull: true // Null if not accepted yet
    },
    lat: { type: DataTypes.FLOAT },
    lng: { type: DataTypes.FLOAT }
});

module.exports = Request;
