const fs = require('fs');
const { getTestReports, getTestDetails, insertTests } = require('../server/tests');
const TestReport = require('../models/test_report');
const TestSuite = require('../models/test_suite');
const TestCase = require('../models/test_case');
const Branch = require('../models/branch');
const Repo = require('../models/repo');

describe('getTestReports', () => {
  beforeEach(() => {
    req = {
      params: {
        branchId: 1,
        repoId: 1
      },
      user: { defaultOrgId: 1 },
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return test reports for a specific branch and repo', async () => {
    const testReports = [
      {
        id: 1,
        resultTime: '2022-01-01',
        duration: 100,
        totalTests: 10,
        totalFailures: 2,
        totalErrors: 3,
        totalSkipped: 1
      },
      {
        id: 2,
        resultTime: '2022-01-02',
        duration: 200,
        totalTests: 20,
        totalFailures: 4,
        totalErrors: 5,
        totalSkipped: 2
      }
    ];

    const findAllTestReportsMock = jest.spyOn(TestReport, 'findAll').mockResolvedValue(testReports);

    await getTestReports(req, res);

    const expectedResult = [
      {
        id: 2,
        date: '2022-01-02T00:00:00.000Z',
        totalPassed: 9,
        totalFailures: 4,
        totalErrors: 5,
        totalSkipped: 2
      },
      {
        id: 1,
        date: '2022-01-01T00:00:00.000Z',
        totalPassed: 4,
        totalFailures: 2,
        totalErrors: 3,
        totalSkipped: 1
      }
    ];

    expect(findAllTestReportsMock).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(expectedResult);
  });

  it('should return 404 if no test reports found', async () => {
    const findAllTestReportsMock = jest.spyOn(TestReport, 'findAll').mockResolvedValue([]);

    await getTestReports(req, res);

    expect(findAllTestReportsMock).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Test Reports not found' });
  });
});

describe('getTestDetails', () => {
  beforeEach(() => {
    req = {
      params: {
        branchId: 1,
        repoId: 1,
        reportId: 1
      },
      user: { defaultOrgId: 1 },
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return test details for a specific branch and repo', async () => {
    const testReport = {
      id: 1,
      resultTime: '2022-01-01',
      duration: 100,
      totalTests: 10,
      totalFailures: 2,
      totalErrors: 3,
      totalSkipped: 1,
      createdAt: '2022-01-01',
      TestSuites: [
        {
          id: 1,
          suiteName: 'Suite1',
          duration: 100,
          totalTests: 10,
          totalFailures: 2,
          totalErrors: 3,
          totalSkipped: 1,
          TestCases: [
            {
              id: 1,
              caseName: 'Test1',
              className: 'Test1',
              duration: 40,
              result: 'PASSED',
              failureMessage: null,
              failureType: null,
              stackTrace: null
            },
            {
              id: 2,
              caseName: 'Test2',
              className: 'Test2',
              duration: 60,
              result: 'FAILED',
              failureMessage: 'Some error',
              failureType: 'Some type',
              stackTrace: 'Some stack trace'
            }
          ]
        }
      ]
    };

    const testReportFindOneMock = jest.spyOn(TestReport, 'findOne').mockResolvedValue(testReport);

    await getTestDetails(req, res);

    const expectedResult = {
      id: 1,
      date: '2022-01-01T00:00:00.000Z',
      totalPassed: 4,
      totalFailures: 2,
      totalErrors: 3,
      totalSkipped: 1,
      TestSuites: testReport.TestSuites
    };

    expect(testReportFindOneMock).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(expectedResult);
  });

  it('should return 404 if no test details found', async () => {
    const testReportFindOneMock = jest.spyOn(TestReport, 'findOne').mockResolvedValue(null);

    await getTestDetails(req, res);

    expect(testReportFindOneMock).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Test Details not found' });
  });
});

describe('insertTests', () => {
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
    const branchFindOneMock = jest.spyOn(Branch, 'findOne').mockResolvedValue(null);
    const branchFindOrCreateMock = jest.spyOn(Branch, 'findOrCreate').mockResolvedValue([{ id: 1 }]);
    const testReportCreateMock = jest.spyOn(TestReport, 'create').mockResolvedValue({ id: 1 });
    const testSuiteCreateMock = jest.spyOn(TestSuite, 'create').mockResolvedValue({ id: 1 });
    const testCaseCreateMock = jest.spyOn(TestCase, 'create').mockResolvedValue({ id: 1 });

    await insertTests(req, res);

    expect(repoFindOrCreateMock).toHaveBeenCalledTimes(1);
    expect(branchFindOneMock).toHaveBeenCalledTimes(1);
    expect(branchFindOrCreateMock).toHaveBeenCalledTimes(1);
    expect(testReportCreateMock).toHaveBeenCalledTimes(1);
    expect(testSuiteCreateMock).toHaveBeenCalledTimes(3);
    expect(testCaseCreateMock).toHaveBeenCalledTimes(17);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Test report uploaded' });
  });
});