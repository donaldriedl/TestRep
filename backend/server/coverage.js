const { XMLParser, XMLValidator } = require('fast-xml-parser');
const { Op, literal } = require('sequelize');
const CoverageReport = require('../models/coverage_report.js');
const CoverageFile = require('../models/coverage_file.js');
const Branch = require('../models/branch.js');
const Repo = require('../models/repo.js');

const parser = new XMLParser({
  ignoreAttributes: false
});

async function getCoverageReports(req, res) {
  const coverageReports = await CoverageReport.findAll({
    attributes: ['id', 'resultTime', 'branchRate', 'lineRate', 'totalLines', 'validLines', 'complexity'],
    where: { 
      branchId: req.params.branchId,
      '$Branch.repoId$': req.params.repoId,
      '$Branch.Repo.organizationId$': req.user.organizationId
    },
    include: [
      {
        model: Branch,
        attributes: [],
        include: [
          {
            model: Repo,
            attributes: []
          }
        ]
      }
    ]
  });

  if (!coverageReports.length) {
    return res.status(404).json({ message: 'Coverage Reports not found' });
  }

  return res.json({ coverageReports });
}

async function getCoverageDetails(req, res) {
  const CoverageDetails = await CoverageReport.findAll({
    attributes: ['id', 'resultTime', 'branchRate', 'lineRate', 'totalLines', 'validLines', 'complexity'],
    where: { branchId: req.params.branchId },
    include: {
      model: Branch,
      attributes: [],
      where: { repoId: req.params.repoId },
      include: {
        model: Repo,
        attributes: [],
        where: { organizationId: req.user.organizationId }
      }
    },
    include: {
      model: CoverageFile,
      attributes: ['id', 'fileName', 'lineRate', 'branchRate']
    },
    order: [[CoverageFile, 'id', 'ASC']]
  });

  if (!CoverageDetails.length) {
    return res.status(404).json({ message: 'Coverage Details not found' });
  }

  return res.json({ CoverageDetails });
}

async function getOrganizationCoverageSummary(req) {
  const lastThirtyDays = new Date();
  lastThirtyDays.setDate(lastThirtyDays.getDate() - 30);

  const coverageReports = await CoverageReport.findAll({
    attributes: [
      [literal('DATE(CoverageReport.createdAt)'), 'date'],
      [literal('AVG(branchRate)'), 'branchRate'],
      [literal('AVG(lineRate)'), 'lineRate'],
    ],
    where: {
      createdAt: { [Op.gte]: lastThirtyDays },
      '$Branch.Repo.organizationId$': req.user.organizationId
    },
    include: [
      {
        model: Branch,
        attributes: [],
        include: [
          {
            model: Repo,
            attributes: [],
            where: { organizationId: req.user.organizationId }
          }
        ]
      }
    ],
    group: ['date']
  });

  if (!coverageReports.length) {
    return null;
  }
  
  const jsonReport = coverageReports.map(report => report.toJSON());
  for (const report of jsonReport) {
    report.date = new Date(report.date).toISOString();
  }

  console.log(jsonReport);

  return jsonReport;
}

async function uploadCoverageReport(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  if (req.file.mimetype !== 'application/xml') {
    return res.status(400).json({ message: 'Invalid file type' });
  }

  const xmlData = req.file.buffer.toString('utf8');
  const validationResult = XMLValidator.validate(xmlData);
  if (validationResult === false || validationResult.err) {
    return res.status(400).json({ message: 'Invalid XML' });
  }

  const parsedData = parser.parse(xmlData);
  if (!parsedData.coverage) {
    return res.status(400).json({ message: 'Invalid XML format' });
  }

  const repo = await Repo.findOrCreate({
    where: { repoName: req.params.repoName, organizationId: req.user.organizationId },
    defaults: { repoName: req.params.repoName, organizationId: req.user.organizationId }
  });

  const branch = await Branch.findOrCreate({
    where: { branchName: req.params.branchName, repoId: repo[0].id },
    defaults: { branchName: req.params.branchName, isPrimary: false, repoId: repo[0].id }
  });

  let resultTime = parsedData.coverage['@_timestamp'];
  if (!resultTime) {
    resultTime = new Date();
  } else {
    resultTime = new Date(Number(resultTime));
  }

  const coverageReport = await CoverageReport.create({
    resultTime,
    branchRate: parsedData.coverage['@_branch-rate'],
    lineRate: parsedData.coverage['@_line-rate'],
    totalLines: parsedData.coverage['@_lines-covered'],
    validLines: parsedData.coverage['@_lines-valid'],
    complexity: parsedData.coverage['@_complexity'],
    branchId: branch[0].id
  });

  const pkgs = parsedData.coverage.packages;
  for (const pkg of pkgs.package) {
    const files = pkg.classes;
    for (const file of files.class) {
      await CoverageFile.create({
        fileName: file['@_filename'],
        branchRate: file['@_branch-rate'],
        lineRate: file['@_line-rate'],
        coverageReportId: coverageReport.id
      });
    }
  }

  return res.sendStatus(201);
}

module.exports = {
  getCoverageReports,
  getCoverageDetails,
  getOrganizationCoverageSummary,
  uploadCoverageReport
};