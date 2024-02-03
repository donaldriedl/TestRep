const { DataTypes } = require('sequelize');
const sequelize = require('../database.js');
const Organization = require('./organization.js');

const Repo = sequelize.define('Repo', {
  repoName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  organizationId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

Repo.belongsTo(Organization, { foreignKey: 'organizationId' });
Organization.hasMany(Repo, { foreignKey: 'organizationId' });

module.exports = Repo;