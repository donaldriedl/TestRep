const Repo = require('../models/repo.js');
const Branch = require('../models/branch.js');
const TestReport = require('../models/test_report.js');
const CoverageReport = require('../models/coverage_report.js');

async function getRepos(req, res) {
  console.log(req.user.organizationId);
  const repos = await Repo.findAll({
    attributes: ['id', 'repoName'],
    where: {
      organizationId: req.user.organizationId
    },
    include: {
      model: Branch,
      attributes: ['id', 'branchName'],
      where: { isPrimary: true },
      include: [
        {
          model: TestReport,
          attributes: ['totalTests', 'totalFailures', 'totalErrors', 'totalSkipped'],
          order: [['createdAt', 'DESC']],
          limit: 1
        },
        {
          model: CoverageReport,
          attributes: ['lineRate', 'branchRate'],
          order: [['createdAt', 'DESC']],
          limit: 1
        }
      ]
    }
  });
  console.log(repos);

  if (!repos.length) {
    return res.status(404).json({ message: 'Repos not found' });
  }

  const jsonResponse = [];
  repos.forEach(repo => {
    const testReport = repo.Branches[0].TestReports[0];
    const coverageReport = repo.Branches[0].CoverageReports[0];
    jsonResponse.push({
      name: repo.repoName,
      totalPassed: testReport.totalTests - testReport.totalFailures - testReport.totalErrors - testReport.totalSkipped,
      totalFailures: testReport.totalFailures,
      totalErrors: testReport.totalErrors,
      totalSkipped: testReport.totalSkipped,
      lineRate: (Number(coverageReport.lineRate) * 100).toFixed(2) + '%',
      branchRate: (Number(coverageReport.branchRate) * 100).toFixed(2) + '%'
    })
  });

  return res.json(jsonResponse);
}

async function getBranches(req, res) {
  const branches = await Branch.findAll({
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

  if (!branches.length) {
    return res.status(404).json({ message: 'Branches not found' });
  }

  return res.json({ branches });
}

module.exports = { getRepos, getBranches };