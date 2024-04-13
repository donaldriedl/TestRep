jest.mock('../server/tests', () => ({
  compareBranchTests: jest.fn().mockResolvedValue({ passed: 10, failed: 2 }),
  getOrganizationTestSummary: jest.fn().mockResolvedValue({ passed: 10, failed: 2 }),
  getRepoTestSummary: jest.fn().mockResolvedValue({ passed: 10, failed: 2 }),
  getBranchTestSummary: jest.fn().mockResolvedValue({ passed: 10, failed: 2 }),
}));

jest.mock('../server/coverage', () => ({
  compareBranchCoverage: jest.fn().mockResolvedValue({ coverage: 80 }),
  getOrganizationCoverageSummary: jest.fn().mockResolvedValue({ coverage: 80 }),
  getRepoCoverageSummary: jest.fn().mockResolvedValue({ coverage: 80 }),
  getBranchCoverageSummary: jest.fn().mockResolvedValue({ coverage: 80 }),
}));

jest.mock('../server/repos', () => ({
  getBranchIdByName: jest.fn().mockResolvedValue(1),
  getPrimaryBranchId: jest.fn().mockResolvedValue(2),
}));

describe('getOrganizationSummary', () => {
  beforeEach(() => {
    req = {};
    res = { json: jest.fn() };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return organization test and coverage summary', async () => {
    const { getOrganizationSummary } = require('../server/reports');

    await getOrganizationSummary(req, res);

    const expectedResult = {
      tests: {
        passed: 10,
        failed: 2
      },
      coverage: { coverage: 80 }
    };
    expect(res.json).toHaveBeenCalledWith(expectedResult);
  });
});

describe('getRepoSummary', () => {
  beforeEach(() => {
    req = {};
    res = { json: jest.fn() };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return repo test and coverage summary', async () => {
    const { getRepoSummary } = require('../server/reports');

    await getRepoSummary(req, res);

    const expectedResult = {
      tests: {
        passed: 10,
        failed: 2
      },
      coverage: { coverage: 80 }
    };
    expect(res.json).toHaveBeenCalledWith(expectedResult);
  });
});

describe('getBranchSummary', () => {
  beforeEach(() => {
    req = {};
    res = { json: jest.fn() };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return branch test and coverage summary', async () => {
    const { getBranchSummary } = require('../server/reports');

    await getBranchSummary(req, res);

    const expectedResult = {
      tests: {
        passed: 10,
        failed: 2
      },
      coverage: { coverage: 80 }
    };
    expect(res.json).toHaveBeenCalledWith(expectedResult);
  });
});

describe('getBranchCompare', () => {
  beforeEach(() => {
    req = {
      params: {
        repoName: 'repo',
        branchName: 'branch'
      }
    };
    res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return branch test and coverage comparison', async () => {
    const { getBranchCompare } = require('../server/reports');

    await getBranchCompare(req, res, 1);

    const expectedResult = {
      tests: {
        passed: 10,
        failed: 2
      },
      coverage: { coverage: 80 }
    };
    expect(res.json).toHaveBeenCalledWith(expectedResult);
  });

  it('should return 404 if primary branch not found', async () => {
    const { getBranchCompare } = require('../server/reports');
    require('../server/repos').getPrimaryBranchId.mockResolvedValue(null);

    await getBranchCompare(req, res, 1);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Primary branch not found' });
  });
});