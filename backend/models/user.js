const { DataTypes } = require('sequelize');
const sequelize = require('../database.js');
const Organization = require('./organization.js');

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pass: {
    type: DataTypes.STRING,
    allowNull: false
  },
  organizationId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

User.belongsTo(Organization, { foreignKey: 'organizationId' });
Organization.hasMany(User, { foreignKey: 'organizationId' });

module.exports = User;