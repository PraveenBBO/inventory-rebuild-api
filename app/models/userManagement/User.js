'use strict';
const { Model, DataTypes } = require('sequelize');
const userManagementSequelize = require('../../../database/sequelizeUserManagement.js');

class User extends Model {}

User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize: userManagementSequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true
});

module.exports = User;
