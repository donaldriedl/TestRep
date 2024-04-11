const { getRepos, getBranches } = require('../server/repos.js');
const Repo = require('../models/repo');
const Branch = require('../models/branch');

describe('getRepos', () => {
  beforeEach(() => {
    req = {
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

  it('should return repos when they exist', async () => {
    const mockRepoData = [
      {
        id: 1,
        repoName: 'Repo 1',
        organizationId: 1,
        Branches: [
          {
            id: 1,
            branchName: 'Branch 1',
            TestReports: [
              {
                totalTests: 10,
                totalFailures: 2,
                totalErrors: 1,
                totalSkipped: 3
              }
            ],
            CoverageReports: [
              {
                lineRate: 0.8,
                branchRate: 0.7
              }
            ]
          }
        ]
      },
    ];

    repoFindAllMock = jest.spyOn(Repo, 'findAll').mockResolvedValue(mockRepoData);

    await getRepos(req, res);

    const expectedResult = [
      {
        id: 1,
        name: 'Repo 1',
        totalPassed: 4,
        totalFailures: 2,
        totalErrors: 1,
        totalSkipped: 3,
        lineRate: '80.00%',
        branchRate: '70.00%'
      }
    ];

    expect(repoFindAllMock).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(expectedResult);
  });

  it('should return 404 when no repos exist', async () => {
    repoFindAllMock = jest.spyOn(Repo, 'findAll').mockResolvedValue([]);

    await getRepos(req, res);

    expect(repoFindAllMock).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Repos not found' });
  });
});

describe('getBranches', () => {
  beforeEach(() => {
    req = {
      params: { repoId: 1 },
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

  it('should return branches when they exist', async () => {
    const expectedBranches = [
      {
        id: 1,
        branchName: 'Branch 1',
        repoId: 1,
        isPrimary: true,
        TestReports: [
          {
            totalTests: 10,
            totalFailures: 2,
            totalErrors: 1,
            totalSkipped: 3
          }
        ],
        CoverageReports: [
          {
            lineRate: 0.8,
            branchRate: 0.7
          }
        ]
      }
    ];

    branchFindAllMock = jest.spyOn(Branch, 'findAll').mockResolvedValue(expectedBranches);

    await getBranches(req, res);

    const expectedResult = [
      {
        id: 1,
        name: 'Branch 1',
        isPrimary: true,
        totalPassed: 4,
        totalFailures: 2,
        totalErrors: 1,
        totalSkipped: 3,
        lineRate: '80.00%',
        branchRate: '70.00%'
      }
    ];

    expect(branchFindAllMock).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(expectedResult);
  });

  it('should return 404 when no branches exist', async () => {
    branchFindAllMock = jest.spyOn(Branch, 'findAll').mockResolvedValue([]);

    await getBranches(req, res);

    expect(branchFindAllMock).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Branches not found' });
  });
});