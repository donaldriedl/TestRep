const { DataTypes } = require('sequelize');
const sequelize = require('../database.js');
const TestSuite = require('./test_suite.js');

const TestCase = sequelize.define('TestCase', {
  caseName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  className: {
    type: DataTypes.STRING,
    allowNull: false
  },
  duration: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  result: {
    type: DataTypes.ENUM('success', 'failure', 'error', 'skipped'),
    allowNull: false
  },
  failureMessage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  failureType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  stackTrace: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  testSuiteId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

TestCase.belongsTo(TestSuite, { foreignKey: 'testSuiteId' });
TestSuite.hasMany(TestCase, { foreignKey: 'testSuiteId' });

module.exports = TestCase;