const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

const storagePath = path.join(__dirname, '..', 'database.sqlite');

sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storagePath,
  logging: false,
  define: {
    timestamps: true,
  },
});


module.exports = sequelize;
