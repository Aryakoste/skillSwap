const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ChatGroup = sequelize.define('ChatGroup', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING, // 'service', 'general', etc.
        allowNull: true
    }
});

module.exports = ChatGroup;
