const { DataTypes } = require('sequelize');
const sequelize = require('../database.js');
const TestReport = require('./test_report.js');

const TestSuite = sequelize.define('TestSuite', {
  suiteName: {
    type: DataTypes.STRING,
    allowNull: false
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
  testReportId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

TestSuite.belongsTo(TestReport, { foreignKey: 'testReportId' });
TestReport.hasMany(TestSuite, { foreignKey: 'testReportId' });

module.exports = TestSuite;