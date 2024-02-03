const { DataTypes } = require('sequelize');
const sequelize = require('../database.js');
const CoverageReport = require('./coverage_report.js');

const CoverageFile = sequelize.define('CoverageFile', {
  fileName: {
    type: DataTypes.STRING,
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
  coverageReportId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

CoverageFile.belongsTo(CoverageReport, { foreignKey: 'coverageReportId' });
CoverageReport.hasMany(CoverageFile, { foreignKey: 'coverageReportId' });

module.exports = CoverageFile;