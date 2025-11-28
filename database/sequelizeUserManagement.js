const { Sequelize } = require('sequelize');
require('dotenv').config(); // Make sure this is at the top if not already included

const userManagementSequelize = new Sequelize(
    process.env.USER_MGMT_DB_NAME,
    process.env.USER_MGMT_DB_USER,
    process.env.USER_MGMT_DB_PASS,
    {
        host: process.env.USER_MGMT_DB_HOST,
        dialect: process.env.USER_MGMT_DB_DIALECT || 'postgres',
        logging: false,
    }
);

module.exports = userManagementSequelize;
