const { DataTypes } = require('sequelize');
const sequelize = require('../database.js');

const Organization = sequelize.define('Organization', {
  organizationName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  organizationUuid: {
    type: DataTypes.UUID,
    allowNull: false
  },
});

module.exports = Organization;