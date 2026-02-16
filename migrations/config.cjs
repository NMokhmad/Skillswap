require('dotenv/config');

module.exports = {
  development: {
    url: process.env.PG_URL,
    dialect: 'postgres',
    logging: false,
  },
  production: {
    url: process.env.PG_URL,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
