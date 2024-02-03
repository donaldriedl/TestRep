const { DataTypes } = require('sequelize');
const sequelize = require('../database.js');
const Branch = require('./branch.js');

const TestReport = sequelize.define('TestReport', {
  resultTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  duration: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  totalTests: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  totalFailures: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  totalErrors: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  totalSkipped: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  branchId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

TestReport.belongsTo(Branch, { foreignKey: 'branchId' });
Branch.hasMany(TestReport, { foreignKey: 'branchId' });

module.exports = TestReport;