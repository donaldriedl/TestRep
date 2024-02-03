const fs = require('fs');
const { getCoverageReports, getCoverageDetails, uploadCoverageReport } = require('../server/coverage');
const Repo = require('../models/repo');
const Branch = require('../models/branch');
const CoverageReport = require('../models/coverage_report');
const CoverageFile = require('../models/coverage_file');

describe('getCoverageReports', () => {
  it('should return coverage reports when they exist', async () => {
    const req = {
      params: {
        branchId: 'branchId',
        repoId: 'repoId'
      },
      user: {
        organizationId: 'organizationId'
      }
    };

    const res = {
      json: jest.fn()
    };

    const findAllCoverageReportsMock = jest.spyOn(CoverageReport, 'findAll').mockResolvedValue([
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
    ]);

    await getCoverageReports(req, res);

    expect(findAllCoverageReportsMock).toHaveBeenCalledWith({
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
          ],
        }
      ],
    });

    expect(res.json).toHaveBeenCalledWith({ coverageReports: [
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
    ] });
  });

  it('should return 404 if no coverage reports are found', async () => {
    const req = {
      params: {
        branchId: 'branchId',
        repoId: 'repoId'
      },
      user: {
        organizationId: 'organizationId'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const coverageReportFindAllMock = jest.spyOn(CoverageReport, 'findAll').mockResolvedValue([]);
    await getCoverageReports(req, res);

    expect(coverageReportFindAllMock).toHaveBeenCalledWith({
      attributes: ['id', 'resultTime', 'branchRate', 'lineRate', 'totalLines', 'validLines', 'complexity'],
      where: {
        branchId: 'branchId',
        '$Branch.repoId$': 'repoId',
        '$Branch.Repo.organizationId$': 'organizationId'
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
    expect(res.json).toHaveBeenCalledWith({ message: 'Coverage Reports not found' });
  });
});

describe('getCoverageDetails', () => {
  it('should return coverage details when they exist', async () => {
    const req = {
      params: {
        branchId: 'branchId',
        repoId: 'repoId'
      },
      user: {
        organizationId: 'organizationId'
      }
    };

    const res = {
      json: jest.fn()
    };

    const coverageReportFindAllMock = jest.spyOn(CoverageReport, 'findAll').mockResolvedValue([
      {
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
      },
      {
        id: 2,
        resultTime: '2022-01-02',
        branchRate: 0.7,
        lineRate: 0.8,
        totalLines: 200,
        validLines: 180,
        complexity: 20,
        CoverageFiles: [
          {
            id: 3,
            fileName: 'file3',
            lineRate: 0.6,
            branchRate: 0.7
          },
          {
            id: 4,
            fileName: 'file4',
            lineRate: 0.5,
            branchRate: 0.6
          }
        ]
      }
    ]);

    await getCoverageDetails(req, res);

    expect(coverageReportFindAllMock).toHaveBeenCalledWith({
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

    expect(res.json).toHaveBeenCalledWith({ CoverageDetails: [
      {
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
      },
      {
        id: 2,
        resultTime: '2022-01-02',
        branchRate: 0.7,
        lineRate: 0.8,
        totalLines: 200,
        validLines: 180,
        complexity: 20,
        CoverageFiles: [
          {
            id: 3,
            fileName: 'file3',
            lineRate: 0.6,
            branchRate: 0.7
          },
          {
            id: 4,
            fileName: 'file4',
            lineRate: 0.5,
            branchRate: 0.6
          }
        ]
      }
    ] });
  });

  it('should return 404 if no coverage details are found', async () => {
    const req = {
      params: {
        branchId: 'branchId',
        repoId: 'repoId'
      },
      user: {
        organizationId: 'organizationId'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const coverageReportFindAllMock = jest.spyOn(CoverageReport, 'findAll').mockResolvedValue([]);
    await getCoverageDetails(req, res);

    expect(coverageReportFindAllMock).toHaveBeenCalledWith({
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

  it('should upload a coverage report', async () => {
    req.file = {
      mimetype: 'application/xml',
      buffer: fs.readFileSync(`${__dirname}/mock_data/valid-coverage.xml`)
    };

    const repoFindOrCreateMock = jest.spyOn(Repo, 'findOrCreate').mockResolvedValue([{ id: 1 }]);
    const branchFindOrCreateMock = jest.spyOn(Branch, 'findOrCreate').mockResolvedValue([{ id: 1 }]);
    const coverageReportCreateMock = jest.spyOn(CoverageReport, 'create').mockResolvedValue({ id: 1 });
    const coverageFileCreateMock = jest.spyOn(CoverageFile, 'create').mockResolvedValue({ id: 1 });

    await uploadCoverageReport(req, res);

    expect(repoFindOrCreateMock).toHaveBeenCalledWith({
      where: { repoName: req.params.repoName, organizationId: req.user.organizationId },
      defaults: { repoName: req.params.repoName, organizationId: req.user.organizationId }
    });

    expect(branchFindOrCreateMock).toHaveBeenCalledWith({
      where: { branchName: req.params.branchName, repoId: 1 },
      defaults: { branchName: req.params.branchName, isPrimary: false, repoId: 1 }
    });

    expect(coverageReportCreateMock).toHaveBeenCalledWith({
      resultTime: new Date(Number("1706985899337")),
      branchRate: "0.6851",
      lineRate: "0.77",
      totalLines: "144",
      validLines: "187",
      complexity: "0",
      branchId: 1
    });
    expect(coverageFileCreateMock).toHaveBeenCalledTimes(14);
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