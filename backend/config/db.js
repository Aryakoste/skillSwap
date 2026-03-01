const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

if (process.env.DB_HOST || process.env.DB_SOCKET_PATH) {
  // Use MySQL if DB_HOST or DB_SOCKET_PATH is provided
  const dialectOptions = process.env.DB_SOCKET_PATH ? { socketPath: process.env.DB_SOCKET_PATH } : {};

  sequelize = new Sequelize(
    process.env.DB_NAME || 'skillswap',
    process.env.DB_USER || 'skillswap',
    process.env.DB_PASSWORD || 'Gg@123123',
    {
      host: '34.57.228.90',
      dialect: 'mysql',
      port: 3306,
      dialectOptions,
      logging: false,
      define: {
        timestamps: true,
      },
    }
  );
} else {
  // Fallback to SQLite
  const storagePath = process.env.NODE_ENV === 'production'
    ? path.join('/tmp', 'database.sqlite')
    : path.join(__dirname, '..', 'database.sqlite');

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false,
    define: {
      timestamps: true,
    },
  });
}

module.exports = sequelize;
