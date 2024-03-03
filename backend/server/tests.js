const { XMLParser, XMLValidator } = require('fast-xml-parser');
const { Op, literal } = require('sequelize');
const TestReport = require('../models/test_report.js');
const TestSuite = require('../models/test_suite.js');
const TestCase = require('../models/test_case.js');
const Branch = require('../models/branch.js');
const Repo = require('../models/repo.js');

const parser = new XMLParser({
  ignoreAttributes: false
});

async function getTestReports(req, res) {
  const testReports = await TestReport.findAll({
    attributes: ['id', 'resultTime', 'duration', 'totalTests', 'totalFailures', 'totalErrors', 'totalSkipped', 'createdAt'],
    where: { 
      branchId: req.params.branchId,
      '$Branch.Repo.organizationId$': req.user.organizationId
    },
    include: [
      {
        model: Branch,
        attributes: [],
        where: { id: req.params.branchId },
        include: [
          {
            model: Repo,
            attributes: []
          }
        ]
      }
    ]
  });

  if (!testReports.length) {
    return res.status(404).json({ message: 'Test Reports not found' });
  }

  for (const report of testReports) {
    if (report.resultTime) {
      report.resultTime = new Date(report.resultTime).toISOString();
    }
    report.createdAt = new Date(report.createdAt).toISOString();
  }

  return res.json({ testReports });
}

async function getTestDetails(req, res) {
  const TestDetails = await TestSuite.findAll({
    attributes: ['id', 'suiteName', 'duration', 'totalTests', 'totalFailures', 'totalErrors', 'totalSkipped'],
    where: { testReportId: req.params.reportId },
    include: {
      model: TestReport,
      attributes: [],
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
      }
    },
    include: {
      model: TestCase,
      attributes: ['caseName', 'className', 'duration', 'result', 'failureMessage', 'failureType', 'stackTrace']
    },
    order: [[TestCase, 'id', 'ASC']]
  });

  if (!TestDetails.length) {
    return res.status(404).json({ message: 'Test Details not found' });
  }

  return res.json({ TestDetails });
}

async function getOrganizationTestSummary(req) {
  const lastThirtyDays = new Date();
  lastThirtyDays.setDate(lastThirtyDays.getDate() - 60);

  const testReports = await TestReport.findAll({
    attributes: [
      [literal('DATE(TestReport.createdAt)'), 'date'], // Specify TestReport.createdAt to avoid ambiguity
      [literal('AVG(COALESCE(totalTests, 0))'), 'totalTests'],
      [literal('AVG(COALESCE(totalFailures, 0))'), 'totalFailures'],
      [literal('AVG(COALESCE(totalErrors, 0))'), 'totalErrors'],
      [literal('AVG(COALESCE(totalSkipped, 0))'), 'totalSkipped'],
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

  if (!testReports.length) {
    return null;
  }

  let jsonReports = testReports.map(report => report.toJSON());
  for (const report of jsonReports) {
    report.date = new Date(report.date).toISOString();
    report.totalPassed = Number(report.totalTests) - (Number(report.totalFailures) + Number(report.totalErrors) + Number(report.totalSkipped));
  }
  console.log(jsonReports);

  return jsonReports;
}

async function getRepoTestSummary(req) {
  const repoId = req.params.repoId;
  const lastThirtyDays = new Date();
  lastThirtyDays.setDate(lastThirtyDays.getDate() - 60);

  const testReports = await TestReport.findAll({
    attributes: [
      [literal('DATE(TestReport.createdAt)'), 'date'],
      [literal('AVG(COALESCE(totalTests, 0))'), 'totalTests'],
      [literal('AVG(COALESCE(totalFailures, 0))'), 'totalFailures'],
      [literal('AVG(COALESCE(totalErrors, 0))'), 'totalErrors'],
      [literal('AVG(COALESCE(totalSkipped, 0))'), 'totalSkipped'],
    ],
    where: {
      createdAt: { [Op.gte]: lastThirtyDays },
      '$Branch.repoId$': repoId,
      '$Branch.Repo.organizationId$': req.user.organizationId
    },
    include: [
      {
        model: Branch,
        attributes: [],
        where: { repoId },
        include: [
          {
            model: Repo,
            attributes: [],
            where: { organizationId: req.user.organizationId }
          }
        ]
      },
    ],
    group: ['date']
  });

  if (!testReports.length) {
    return null;
  }

  let jsonReports = testReports.map(report => report.toJSON());
  for (const report of jsonReports) {
    report.date = new Date(report.date).toISOString();
    report.totalPassed = Number(report.totalTests) - (Number(report.totalFailures) + Number(report.totalErrors) + Number(report.totalSkipped));
  }

  return jsonReports;
}

async function getBranchTestSummary(req) {
  const branchId = req.params.branchId;
  const lastThirtyDays = new Date();
  lastThirtyDays.setDate(lastThirtyDays.getDate() - 60);

  const testReports = await TestReport.findAll({
    attributes: [
      [literal('DATE(TestReport.createdAt)'), 'date'],
      [literal('AVG(COALESCE(totalTests, 0))'), 'totalTests'],
      [literal('AVG(COALESCE(totalFailures, 0))'), 'totalFailures'],
      [literal('AVG(COALESCE(totalErrors, 0))'), 'totalErrors'],
      [literal('AVG(COALESCE(totalSkipped, 0))'), 'totalSkipped'],
    ],
    where: {
      createdAt: { [Op.gte]: lastThirtyDays },
      branchId,
      '$Branch.Repo.organizationId$': req.user.organizationId
    },
    include: [
      {
        model: Branch,
        attributes: [],
        where: { id: branchId },
        include: [
          {
            model: Repo,
            attributes: [],
            where: { organizationId: req.user.organizationId }
          }
        ]
      },
    ],
    group: ['date']
  });

  if (!testReports.length) {
    return null;
  }

  let jsonReports = testReports.map(report => report.toJSON());
  for (const report of jsonReports) {
    report.date = new Date(report.date).toISOString();
    report.totalPassed = Number(report.totalTests) - (Number(report.totalFailures) + Number(report.totalErrors) + Number(report.totalSkipped));
  }

  return jsonReports;
}

async function insertTests(req, res, organizationId) {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  if (req.file.mimetype !== 'application/xml') {
    return res.status(400).json({ message: 'Invalid file type' });
  }
  
  const rawXml = req.file.buffer.toString('utf8');
  const validationResult = XMLValidator.validate(rawXml);
  if (validationResult === false || validationResult.err) {
    return res.status(400).json({ message: 'Invalid XML' });
  }
  const parsedXml = parser.parse(rawXml);

  const repo = await Repo.findOrCreate({
    where: { repoName: req.params.repoName, organizationId },
    defaults: { repoName: req.params.repoName, organizationId }
  });

  const branch = await Branch.findOrCreate({
    where: { branchName: req.params.branchName, repoId: repo[0].id },
    defaults: { branchName: req.params.branchName, isPrimary: false, repoId: repo[0].id }
  });

  const testReport = await TestReport.create({
    resultTime: parsedXml.testsuites['@_timestamp'],
    duration: parsedXml.testsuites['@_time'],
    totalTests: parsedXml.testsuites['@_tests'],
    totalFailures: parsedXml.testsuites['@_failures'],
    totalErrors: parsedXml.testsuites['@_errors'],
    totalSkipped: parsedXml.testsuites['@_skipped'],
    branchId: branch[0].id
  });

  const testSuites = parsedXml.testsuites.testsuite;
  if (!Array.isArray(testSuites)) {
    testSuites = [testSuites];
  }

  for (const suite of testSuites) {
    if (suite['@_tests'] === '0') {
      continue;
    }

    const testSuite = await TestSuite.create({
      suiteName: suite['@_name'],
      duration: suite['@_time'],
      totalTests: suite['@_tests'],
      totalFailures: suite['@_failures'],
      totalErrors: suite['@_errors'],
      totalSkipped: suite['@_skipped'],
      testReportId: testReport.id
    });

    if(!suite.testcase) {
      continue;
    }

    const testCases = suite.testcase;
    if (!Array.isArray(testCases)) {
      testCases = [testCases];
    }

    for (const testCase of testCases) {
      await TestCase.create({
        caseName: testCase['@_name'],
        className: testCase['@_classname'],
        duration: testCase['@_time'],
        result: testCase.failure ? 'failure' : 'success',
        failureMessage: testCase.failure ? testCase.failure['@_message'] : null,
        failureType: testCase.failure ? testCase.failure['@_type'] : null,
        stackTrace: testCase.failure ? testCase.failure['#text'] : null,
        testSuiteId: testSuite.id
      });
    }
  }

  res.sendStatus(200);
}

module.exports = {
  getTestReports,
  getTestDetails,
  getBranchTestSummary,
  getOrganizationTestSummary,
  getRepoTestSummary,
  insertTests
};