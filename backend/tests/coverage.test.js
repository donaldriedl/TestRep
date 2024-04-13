const fs = require('fs');
const {
  compareBranchCoverage,
  getCoverageReports,
  getCoverageDetails,
  getBranchCoverageSummary,
  getOrganizationCoverageSummary,
  getRepoCoverageSummary,
  uploadCoverageReport
} = require('../server/coverage');
const Repo = require('../models/repo');
const Branch = require('../models/branch');
const CoverageReport = require('../models/coverage_report');
const CoverageFile = require('../models/coverage_file');

describe('getCoverageReports', () => {
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

  it('should return coverage reports when they exist', async () => {
    const coverageReports = [
      {
        id: 1,
        resultTime: '2022-01-01',
        branchRate: 0.8,
        lineRate: 0.9,
        totalLines: 100,
        validLines: 90,
        complexity: 10
      },
      {
        id: 2,
        resultTime: '2022-01-02',
        branchRate: 0.7,
        lineRate: 0.8,
        totalLines: 200,
        validLines: 180,
        complexity: 20
      }
    ];
    const findAllCoverageReportsMock = jest.spyOn(CoverageReport, 'findAll').mockResolvedValue(coverageReports);

    await getCoverageReports(req, res);

    const expectedResult = [
      {
        id: 2,
        date: '2022-01-02T00:00:00.000Z',
        branchRate: 0.7,
        lineRate: 0.8,
      },
      {
        id: 1,
        date: '2022-01-01T00:00:00.000Z',
        branchRate: 0.8,
        lineRate: 0.9,
      },
    ]

    expect(findAllCoverageReportsMock).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(expectedResult);
  });

  it('should return 404 if no coverage reports are found', async () => {
    const coverageReportFindAllMock = jest.spyOn(CoverageReport, 'findAll').mockResolvedValue([]);

    await getCoverageReports(req, res);

    expect(coverageReportFindAllMock).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Coverage Reports not found' });
  });
});

describe('getCoverageDetails', () => {
  beforeEach(() => {
    req = {
      params: {
        branchId: 'branchId',
        repoId: 'repoId'
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

  it('should return coverage details when they exist', async () => {
    const coverageReport = {
      id: 1,
      resultTime: '2022-01-01',
      branchRate: 0.8,
      lineRate: 0.9,
      totalLines: 100,
      validLines: 90,
      complexity: 10,
      CoverageFiles: [
        {
          id: 1,
          fileName: 'file1',
          lineRate: 0.8,
          branchRate: 0.9
        },
        {
          id: 2,
          fileName: 'file2',
          lineRate: 0.7,
          branchRate: 0.8
        }
      ]
    };

    const coverageReportFindOneMock = jest.spyOn(CoverageReport, 'findAll').mockResolvedValue(coverageReport);

    await getCoverageDetails(req, res);

    const expectedResult = {
      coverageDetails: {
        id: 1,
        resultTime: '2022-01-01',
        branchRate: 0.8,
        lineRate: 0.9,
        totalLines: 100,
        validLines: 90,
        complexity: 10,
        CoverageFiles: [
          {
            id: 2,
            fileName: 'file2',
            lineRate: 0.7,
            branchRate: 0.8
          },
          {
            id: 1,
            fileName: 'file1',
            lineRate: 0.8,
            branchRate: 0.9
          },
        ]
      },
    };

    expect(coverageReportFindOneMock).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(expectedResult);
  });

  it('should return 404 if no coverage details are found', async () => {
    const coverageReportFindAllMock = jest.spyOn(CoverageReport, 'findOne').mockResolvedValue(null);

    await getCoverageDetails(req, res);

    expect(coverageReportFindAllMock).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Coverage Details not found' });
  });
});

describe('uploadCoverageReport', () => {
  beforeEach(() => {
    req = {
      params: {
        repoName: 'testRepo',
        branchName: 'testBranch'
      },
      user: { organizationId: 1 }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should upload a coverage report', async () => {
    req.file = {
      mimetype: 'application/xml',
      buffer: fs.readFileSync(`${__dirname}/mock_data/valid-coverage.xml`)
    };

    const repoFindOrCreateMock = jest.spyOn(Repo, 'findOrCreate').mockResolvedValue([{ id: 1 }]);
    const branchFindOneMock = jest.spyOn(Branch, 'findOne').mockResolvedValue(null);
    const branchFindOrCreateMock = jest.spyOn(Branch, 'findOrCreate').mockResolvedValue([{ id: 1 }]);
    const coverageReportCreateMock = jest.spyOn(CoverageReport, 'create').mockResolvedValue({ id: 1 });
    const coverageFileCreateMock = jest.spyOn(CoverageFile, 'create').mockResolvedValue({ id: 1 });

    await uploadCoverageReport(req, res);

    expect(repoFindOrCreateMock).toHaveBeenCalledTimes(1);
    expect(branchFindOneMock).toHaveBeenCalledTimes(1);
    expect(branchFindOrCreateMock).toHaveBeenCalledTimes(1);
    expect(coverageReportCreateMock).toHaveBeenCalledTimes(1);
    expect(coverageFileCreateMock).toHaveBeenCalledTimes(14);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Coverage report uploaded' });
  });

  it('should return 400 if no file uploaded', async () => {
    await uploadCoverageReport(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'No file uploaded' });
  });

  it('should return 400 if file mimetype is invalid', async () => {
    req.file = {
      mimetype: 'invalid',
      buffer: fs.readFileSync(`${__dirname}/mock_data/valid-coverage.xml`)
    };

    await uploadCoverageReport(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid file type' });
  });

  it('should return 400 if file is not valid XML', async () => {
    req.file = {
      mimetype: 'application/xml',
      buffer: fs.readFileSync(`${__dirname}/mock_data/invalid.xml`)
    };

    await uploadCoverageReport(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid XML' });
  });

  it('should return 400 if not valid cobertura XML', async () => {
    req.file = {
      mimetype: 'application/xml',
      buffer: fs.readFileSync(`${__dirname}/mock_data/invalid-coverage.xml`)
    };

    await uploadCoverageReport(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid XML format' });
  });
});

describe('getOrganizationCoverageSummary', () => {
  beforeEach(() => {
    req = { user: { defaultOrgId: 1 } };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return organization coverage summary', async () => {
    const lastThirtyDays = new Date();
    lastThirtyDays.setDate(lastThirtyDays.getDate() - 30);
    const currentTime = new Date().toISOString();

    const coverageReports = [
      {
        toJSON: jest.fn().mockReturnValue({
          date: lastThirtyDays.toISOString(),
          branchRate: 0.8,
          lineRate: 0.9,
        }),
      },
      {
        toJSON: jest.fn().mockReturnValue({
          date: currentTime,
          branchRate: 0.7,
          lineRate: 0.8,
        })
      },
    ];

    const coverageReportFindAllMock = jest.spyOn(CoverageReport, 'findAll').mockResolvedValue(coverageReports);

    const result = await getOrganizationCoverageSummary(req);

    const expectedResult = [
      {
        date: lastThirtyDays.toISOString(),
        branchRate: 0.8,
        lineRate: 0.9,
      },
      {
        date: currentTime,
        branchRate: 0.7,
        lineRate: 0.8,
      },
    ];

    expect(coverageReportFindAllMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedResult);
  });

  it('should return null if no coverage reports exist', async () => {
    const coverageReportFindAllMock = jest.spyOn(CoverageReport, 'findAll').mockResolvedValue([]);

    const result = await getOrganizationCoverageSummary(req);

    expect(coverageReportFindAllMock).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
  });
});

describe('getRepoCoverageSummary', () => {
  beforeEach(() => {
    req = {
      params: { repoId: 'repoId' },
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

  it('should return repo coverage summary', async () => {
    const lastThirtyDays = new Date();
    lastThirtyDays.setDate(lastThirtyDays.getDate() - 30);
    const currentTime = new Date().toISOString();

    const coverageReports = [
      {
        toJSON: jest.fn().mockReturnValue({
          date: lastThirtyDays.toISOString(),
          branchRate: 0.8,
          lineRate: 0.9,
        }),
      },
      {
        toJSON: jest.fn().mockReturnValue({
          date: currentTime,
          branchRate: 0.7,
          lineRate: 0.8,
        })
      },
    ];

    const coverageReportFindAllMock = jest.spyOn(CoverageReport, 'findAll').mockResolvedValue(coverageReports);

    const result = await getRepoCoverageSummary(req);

    const expectedResult = [
      {
        date: lastThirtyDays.toISOString(),
        branchRate: 0.8,
        lineRate: 0.9,
      },
      {
        date: currentTime,
        branchRate: 0.7,
        lineRate: 0.8,
      },
    ];

    expect(coverageReportFindAllMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedResult);
  });

  it('should return null if no coverage reports exist', async () => {
    const coverageReportFindAllMock = jest.spyOn(CoverageReport, 'findAll').mockResolvedValue([]);

    const result = await getRepoCoverageSummary(req);

    expect(coverageReportFindAllMock).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
  });
});

describe('getBranchCoverageSummary', () => {
  beforeEach(() => {
    req = {
      params: { branchId: 'branchId' },
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

  it('should return branch coverage summary', async () => {
    const lastThirtyDays = new Date();
    lastThirtyDays.setDate(lastThirtyDays.getDate() - 30);
    const currentTime = new Date().toISOString();

    const coverageReports = [
      {
        toJSON: jest.fn().mockReturnValue({
          date: lastThirtyDays.toISOString(),
          branchRate: 0.8,
          lineRate: 0.9,
        }),
      },
      {
        toJSON: jest.fn().mockReturnValue({
          date: currentTime,
          branchRate: 0.7,
          lineRate: 0.8,
        })
      },
    ];

    const coverageReportFindAllMock = jest.spyOn(CoverageReport, 'findAll').mockResolvedValue(coverageReports);

    const result = await getBranchCoverageSummary(req);

    const expectedResult = [
      {
        date: lastThirtyDays.toISOString(),
        branchRate: 0.8,
        lineRate: 0.9,
      },
      {
        date: currentTime,
        branchRate: 0.7,
        lineRate: 0.8,
      },
    ];

    expect(coverageReportFindAllMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedResult);
  });

  it('should return null if no coverage reports exist', async () => {
    const coverageReportFindAllMock = jest.spyOn(CoverageReport, 'findAll').mockResolvedValue([]);

    const result = await getBranchCoverageSummary(req);

    expect(coverageReportFindAllMock).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
  });
});

describe('compareBranchCoverage', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return coverage comparison', async () => {
    const branchId = 1;
    const primaryBranchId = 2;

    const branchCoverage = {
      branchRate: 0.8,
      lineRate: 0.9,
    };

    const primaryBranchCoverage = {
      branchRate: 0.7,
      lineRate: 0.8,
    };

    const testReportFindOneMock = jest.spyOn(CoverageReport, 'findOne').mockImplementation((query) => {
      if (query.where.branchId === 1) {
        return branchCoverage;
      } else if (query.where.branchId === 2) {
        return primaryBranchCoverage;
      }
    });

    const result = await compareBranchCoverage(branchId, primaryBranchId);

    const expectedResult = {
      primaryBranch: {
        branchRate: '70.00%',
        lineRate: '80.00%',
      },
      branch: {
        branchRate: '80.00%',
        lineRate: '90.00%',
      },
      difference: {
        branchRate: '10.00%',
        lineRate: '10.00%',
      }
    };

    expect(testReportFindOneMock).toHaveBeenCalledTimes(2);
    expect(result).toEqual(expectedResult);
  });
});