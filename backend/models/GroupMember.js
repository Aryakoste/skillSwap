const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const GroupMember = sequelize.define('GroupMember', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    groupId: {
        type: DataTypes.UUID,
        allowNull: false
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['userId', 'groupId']
        }
    ]
});

module.exports = GroupMember;
