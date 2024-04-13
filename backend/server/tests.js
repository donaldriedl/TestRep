const { XMLParser, XMLValidator } = require('fast-xml-parser');
const { Op, literal, Sequelize } = require('sequelize');
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
      '$Branch.Repo.organizationId$': req.user.defaultOrgId,
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

  let tests = [];

  for (const report of testReports) {
    if (report.resultTime) {
      report.resultTime = new Date(report.resultTime).toISOString();
    } else {
      report.createdAt = new Date(report.createdAt).toISOString();
    }

    const data = {
      id: report.id,
      date: report.resultTime ? report.resultTime : report.createdAt,
      totalPassed: report.totalTests - (report.totalFailures + report.totalErrors + report.totalSkipped),
      totalFailures: report.totalFailures,
      totalErrors: report.totalErrors,
      totalSkipped: report.totalSkipped,
    }
    tests.push(data);
  }

  tests.sort((a, b) => new Date(b.date) - new Date(a.date));
  return res.json(tests);
}

async function getTestDetails(req, res) {
  const testDetails = await TestReport.findOne({
    attributes: ['id', 'resultTime', 'duration', 'totalTests', 'totalFailures', 'totalErrors', 'totalSkipped', 'createdAt'],
    where: { 
      id: req.params.reportId,
      '$Branch.Repo.organizationId$': req.user.defaultOrgId,
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
      },
      {
        model: TestSuite,
        attributes: ['id', 'suiteName', 'duration', 'totalTests', 'totalFailures', 'totalErrors', 'totalSkipped'],
        where: { testReportId: req.params.reportId },
        include: [
          {
            model: TestCase,
            attributes: ['id', 'caseName', 'className', 'duration', 'result', 'failureMessage', 'failureType', 'stackTrace'],
            where: { testSuiteId: Sequelize.col('TestSuites.id') }
          }
        ]
      }
    ]
  });

  if (!testDetails) {
    return res.status(404).json({ message: 'Test Details not found' });
  }

  if (testDetails.resultTime) {
    testDetails.resultTime = new Date(testDetails.resultTime).toISOString();
  } else {
    testDetails.createdAt = new Date(testDetails.createdAt).toISOString();
  }

  const details = {
    id: testDetails.id,
    date: testDetails.resultTime ? testDetails.resultTime : testDetails.createdAt,
    totalPassed: testDetails.totalTests - (testDetails.totalFailures + testDetails.totalErrors + testDetails.totalSkipped),
    totalFailures: testDetails.totalFailures,
    totalErrors: testDetails.totalErrors,
    totalSkipped: testDetails.totalSkipped,
    TestSuites: testDetails.TestSuites
  }

  return res.json(details);
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
      '$Branch.Repo.organizationId$': req.user.defaultOrgId,
    },
    include: [
      {
        model: Branch,
        attributes: [],
        include: [
          {
            model: Repo,
            attributes: [],
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
      '$Branch.Repo.organizationId$': req.user.defaultOrgId,
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
      '$Branch.Repo.organizationId$': req.user.defaultOrgId,
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

async function compareBranchTests(branchId, primaryBranchId) {
  const primaryBranchData = await TestReport.findOne({
    where: {
      branchId: primaryBranchId,
    },
    order: [['createdAt', 'DESC']]
  });

  const branchData = await TestReport.findOne({
    where: {
      branchId,
    },
    order: [['createdAt', 'DESC']]
  });

  const response = {
    primaryBranch: {
      totalPassed: primaryBranchData.totalTests - (primaryBranchData.totalFailures + primaryBranchData.totalErrors + primaryBranchData.totalSkipped),
      totalFailures: primaryBranchData.totalFailures,
      totalErrors: primaryBranchData.totalErrors,
      totalSkipped: primaryBranchData.totalSkipped ?? 0,
    },
    branch: {
      totalPassed: branchData.totalTests - (branchData.totalFailures + branchData.totalErrors + branchData.totalSkipped),
      totalFailures: branchData.totalFailures,
      totalErrors: branchData.totalErrors,
      totalSkipped: branchData.totalSkipped ?? 0,
    },
    difference: {
      totalPassed: branchData.totalTests - (branchData.totalFailures + branchData.totalErrors + branchData.totalSkipped) - (primaryBranchData.totalTests - (primaryBranchData.totalFailures + primaryBranchData.totalErrors + primaryBranchData.totalSkipped)),
      totalFailures: branchData.totalFailures - primaryBranchData.totalFailures,
      totalErrors: branchData.totalErrors - primaryBranchData.totalErrors,
      totalSkipped: branchData.totalSkipped - primaryBranchData.totalSkipped,
    }
  }

  return response;
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

  const existingBranch = await Branch.findOne({
    where: { repoId: repo[0].id, isPrimary: true }
  });
  const isPrimary = !existingBranch;

  const branch = await Branch.findOrCreate({
    where: { branchName: req.params.branchName, repoId: repo[0].id },
    defaults: { branchName: req.params.branchName, isPrimary, repoId: repo[0].id }
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
        stackTrace: testCase.failure ? testCase.failure : null,
        testSuiteId: testSuite.id
      });
    }
  }

  res.status(201).json({ message: 'Test report uploaded' });
}

module.exports = {
  compareBranchTests,
  getTestReports,
  getTestDetails,
  getBranchTestSummary,
  getOrganizationTestSummary,
  getRepoTestSummary,
  insertTests
};