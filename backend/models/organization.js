const { DataTypes } = require('sequelize');
const sequelize = require('../database.js');

const Organization = sequelize.define('Organization', {
  organizationName: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Organization;