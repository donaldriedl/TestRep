const { getRepos, getBranches } = require('../server/repos.js');
const Repo = require('../models/repo');
const Branch = require('../models/branch');

describe('getRepos', () => {
  it('should return repos when they exist', async () => {
    const req = {
      user: {
        organizationId: 1
      }
    };
    const res = {
      json: jest.fn()
    };

    const expectedRepos = [
      { id: 1, repoName: 'Repo 1' },
      { id: 2, repoName: 'Repo 2' }
    ];

    Repo.findAll = jest.fn().mockResolvedValue(expectedRepos);

    await getRepos(req, res);

    expect(Repo.findAll).toHaveBeenCalledWith({
      attributes: ['id', 'repoName'],
      where: {
        organizationId: req.user.organizationId
      }
    });
    expect(res.json).toHaveBeenCalledWith({ repos: expectedRepos });
  });

  it('should return 404 when no repos exist', async () => {
    const req = {
      user: {
        organizationId: 1
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    Repo.findAll = jest.fn().mockResolvedValue([]);

    await getRepos(req, res);

    expect(Repo.findAll).toHaveBeenCalledWith({
      attributes: ['id', 'repoName'],
      where: {
        organizationId: req.user.organizationId
      }
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Repos not found' });
  });
});

describe('getBranches', () => {
  it('should return branches when they exist', async () => {
    const req = {
      params: {
        repoId: 1
      },
      user: {
        organizationId: 1
      }
    };
    const res = {
      json: jest.fn()
    };

    const expectedBranches = [
      { id: 1, branchName: 'Branch 1', repoId: 1, isPrimary: true },
      { id: 2, branchName: 'Branch 2', repoId: 1, isPrimary: false }
    ];

    Branch.findAll = jest.fn().mockResolvedValue(expectedBranches);

    await getBranches(req, res);

    expect(Branch.findAll).toHaveBeenCalledWith({
      attributes: ['id', 'branchName', 'repoId', 'isPrimary'],
      where: {
        repoId: req.params.repoId
      },
      include: {
        attributes: ['repoName', 'organizationId'],
        model: Repo,
        where: {
          organizationId: req.user.organizationId
        }
      },
    });
    expect(res.json).toHaveBeenCalledWith({ branches: expectedBranches });
  });

  it('should return 404 when no branches exist', async () => {
    const req = {
      params: {
        repoId: 1
      },
      user: {
        organizationId: 1
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    Branch.findAll = jest.fn().mockResolvedValue([]);

    await getBranches(req, res);

    expect(Branch.findAll).toHaveBeenCalledWith({
      attributes: ['id', 'branchName', 'repoId', 'isPrimary'],
      where: {
        repoId: req.params.repoId
      },
      include: {
        attributes: ['repoName', 'organizationId'],
        model: Repo,
        where: {
          organizationId: req.user.organizationId
        }
      },
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Branches not found' });
  });
});