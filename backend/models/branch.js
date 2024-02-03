const { DataTypes } = require('sequelize');
const sequelize = require('../database.js');
const Repo = require('./repo.js');

const Branch = sequelize.define('Branch', {
  branchName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  repoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

Branch.belongsTo(Repo, { foreignKey: 'repoId' });
Repo.hasMany(Branch, { foreignKey: 'repoId' });

module.exports = Branch;