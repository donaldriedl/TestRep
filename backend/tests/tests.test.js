const fs = require('fs');
const { getTestReports, getTestDetails, insertTests } = require('../server/tests');
const TestReport = require('../models/test_report');
const TestSuite = require('../models/test_suite');
const TestCase = require('../models/test_case');
const Branch = require('../models/branch');
const Repo = require('../models/repo');
const Sequelize = require('sequelize');

describe('getTestReports', () => {
  it('should return test reports for a specific branch and repo', async () => {
    const req = {
      params: { branchId: 1, repoId: 1 },
      user: { organizationId: 1 }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const findAllTestReportsMock = jest.spyOn(TestReport, 'findAll').mockResolvedValue([
      { id: 1, resultTime: '2022-01-01', duration: 100 },
      { id: 2, resultTime: '2022-01-02', duration: 200 }
    ]);
    jest.spyOn(Branch, 'findAll').mockResolvedValue({ id: 1, repoId: 1 });
    jest.spyOn(Repo, 'findAll').mockResolvedValue({ id: 1, organizationId: 1 });

    await getTestReports(req, res);

    expect(findAllTestReportsMock).toHaveBeenCalledWith({
      attributes: ['id', 'resultTime', 'duration', 'totalTests', 'totalFailures', 'totalErrors', 'totalSkipped'],
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

    expect(res.json).toHaveBeenCalledWith({ testReports: [
      { id: 1, resultTime: '2022-01-01', duration: 100 },
      { id: 2, resultTime: '2022-01-02', duration: 200 }
    ] });
  });

  it('should return 404 if no test reports found', async () => {
    const req = {
      params: { branchId: 1, repoId: 1 },
      user: { organizationId: 1 }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const findAllTestReportsMock = jest.spyOn(TestReport, 'findAll').mockResolvedValue([]);
    jest.spyOn(Branch, 'findAll').mockResolvedValue([]);
    jest.spyOn(Repo, 'findAll').mockResolvedValue([]);

    await getTestReports(req, res);

    expect(findAllTestReportsMock).toHaveBeenCalledWith({
      attributes: ['id', 'resultTime', 'duration', 'totalTests', 'totalFailures', 'totalErrors', 'totalSkipped'],
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

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Test Reports not found' });
  });
});

describe('getTestDetails', () => {
  it('should return test details for a specific branch and repo', async () => {
    const req = {
      params: { branchId: 1, repoId: 1, reportId: 1 },
      user: { organizationId: 1 }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const findAllTestSuitesMock = jest.spyOn(TestSuite, 'findAll').mockResolvedValue([
      {
        id: 1, suiteName: 'Suite1', duration: 100, totalTests: 10, totalFailures: 2, totalErrors: 3, totalSkipped: 1,
        Tests: [
          { id: 1, name: 'Test1', duration: 10, status: 'PASSED', message: null, stackTrace: null },
          { id: 2, name: 'Test2', duration: 20, status: 'FAILED', message: 'Some error', stackTrace: 'Some stack trace' }
        ]
      },
      {
        id: 2, suiteName: 'Suite2', duration: 200, totalTests: 20, totalFailures: 4, totalErrors: 5, totalSkipped: 2,
        Tests: [
          { id: 3, name: 'Test3', duration: 30, status: 'PASSED', message: null, stackTrace: null },
          { id: 4, name: 'Test4', duration: 40, status: 'FAILED', message: 'Some error', stackTrace: 'Some stack trace' }
        ]
      }
    ]);
    jest.spyOn(TestCase, 'findAll').mockResolvedValue([]);
    jest.spyOn(TestReport, 'findAll').mockResolvedValue([]);
    jest.spyOn(Branch, 'findAll').mockResolvedValue([]);
    jest.spyOn(Repo, 'findAll').mockResolvedValue([]);
    jest.spyOn(Sequelize, 'col').mockReturnValue('TestSuite.id');

    await getTestDetails(req, res);

    expect(findAllTestSuitesMock).toHaveBeenCalledWith({
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

    expect(res.json).toHaveBeenCalledWith({ TestDetails: [
      {
        id: 1, suiteName: 'Suite1', duration: 100, totalTests: 10, totalFailures: 2, totalErrors: 3, totalSkipped: 1,
        Tests: [
          { id: 1, name: 'Test1', duration: 10, status: 'PASSED', message: null, stackTrace: null },
          { id: 2, name: 'Test2', duration: 20, status: 'FAILED', message: 'Some error', stackTrace: 'Some stack trace' }
        ]
      },
      {
        id: 2, suiteName: 'Suite2', duration: 200, totalTests: 20, totalFailures: 4, totalErrors: 5, totalSkipped: 2,
        Tests: [
          { id: 3, name: 'Test3', duration: 30, status: 'PASSED', message: null, stackTrace: null },
          { id: 4, name: 'Test4', duration: 40, status: 'FAILED', message: 'Some error', stackTrace: 'Some stack trace' }
        ]
      }
    ] });
  });

  it('should return 404 if no test details found', async () => {
    const req = {
      params: { branchId: 1, repoId: 1, reportId: 1 },
      user: { organizationId: 1 }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const findAllTestSuitesMock = jest.spyOn(TestSuite, 'findAll').mockResolvedValue([]);
    jest.spyOn(TestCase, 'findAll').mockResolvedValue([]);
    jest.spyOn(TestReport, 'findAll').mockResolvedValue([]);
    jest.spyOn(Branch, 'findAll').mockResolvedValue([]);
    jest.spyOn(Repo, 'findAll').mockResolvedValue([]);
    jest.spyOn(Sequelize, 'col').mockReturnValue('TestSuite.id');

    await getTestDetails(req, res);

    expect(findAllTestSuitesMock).toHaveBeenCalledWith({
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

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Test Details not found' });
  });
});

describe('insertTests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {
        repoName: 'testRepo',
        branchName: 'testBranch'
      },
      user: {
        organizationId: 1
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      sendStatus: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    req = {};
    res = {};
  });

  it('should return 400 if no file is uploaded', async () => {
    req.file = null;

    await insertTests(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'No file uploaded' });
  });

  it('should return 400 if the file type is invalid', async () => {
    req.file = {};
    req.file.mimetype = 'text/plain';

    await insertTests(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid file type' });
  });

  it('should return 400 if the XML is invalid', async () => {
    req.file = {
      mimetype: 'application/xml',
      buffer: fs.readFileSync(`${__dirname}/mock_data/invalid.xml`)
    };

    await insertTests(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid XML' });
  });

  it('should create repo, branch, test report, test suites, and test cases', async () => {
    req.file = {
      mimetype: 'application/xml',
      buffer: fs.readFileSync(`${__dirname}/mock_data/valid-unit-test.xml`)
    };

    const repoFindOrCreateMock = jest.spyOn(Repo, 'findOrCreate').mockResolvedValue([{ id: 1 }]);
    const branchFindOrCreateMock = jest.spyOn(Branch, 'findOrCreate').mockResolvedValue([{ id: 1 }]);
    const testReportCreateMock = jest.spyOn(TestReport, 'create').mockResolvedValue({ id: 1 });
    const testSuiteCreateMock = jest.spyOn(TestSuite, 'create').mockResolvedValue({ id: 1 });
    const testCaseCreateMock = jest.spyOn(TestCase, 'create').mockResolvedValue({ id: 1 });

    await insertTests(req, res);

    expect(repoFindOrCreateMock).toHaveBeenCalledWith({
      where: { repoName: req.params.repoName, organizationId: req.user.organizationId },
      defaults: { repoName: req.params.repoName, organizationId: req.user.organizationId }
    });

    expect(branchFindOrCreateMock).toHaveBeenCalledWith({
      where: { branchName: req.params.branchName, repoId: 1 },
      defaults: { branchName: req.params.branchName, isPrimary: false, repoId: 1 }
    });

    expect(testReportCreateMock).toHaveBeenCalledWith({
      resultTime: undefined,
      duration: "1.127",
      totalTests: "17",
      totalFailures: "1",
      totalErrors: "0",
      totalSkipped: undefined,
      branchId: 1
    });

    expect(testSuiteCreateMock).toHaveBeenCalledTimes(3);
    expect(testCaseCreateMock).toHaveBeenCalledTimes(17);

    expect(res.sendStatus).toHaveBeenCalledWith(200);
  });
});