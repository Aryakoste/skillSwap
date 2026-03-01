const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Endorsement = sequelize.define('Endorsement', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    text: { type: DataTypes.TEXT, allowNull: false },
    rating: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5 }
});

module.exports = Endorsement;
