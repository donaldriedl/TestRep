const { DataTypes } = require('sequelize');
const sequelize = require('../database.js');
const Branch = require('./branch.js');

const CoverageReport = sequelize.define('CoverageReport', {
  resultTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  branchRate: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  lineRate: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  totalLines: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  validLines: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  complexity: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  branchId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

CoverageReport.belongsTo(Branch, { foreignKey: 'branchId' });
Branch.hasMany(CoverageReport, { foreignKey: 'branchId' });

module.exports = CoverageReport;