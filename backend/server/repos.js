const Repo = require('../models/repo.js');
const Branch = require('../models/branch.js');
const TestReport = require('../models/test_report.js');
const CoverageReport = require('../models/coverage_report.js');

async function getRepos(req, res) {
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

  if (!repos.length) {
    return res.status(404).json({ message: 'Repos not found' });
  }

  const jsonResponse = [];
  repos.forEach(repo => {
    const testReport = repo.Branches[0].TestReports[0];
    const coverageReport = repo.Branches[0].CoverageReports[0];

    const totalPassed = testReport ? testReport.totalTests - testReport.totalFailures - testReport.totalErrors - testReport.totalSkipped : null;
    const totalFailures = testReport ? testReport.totalFailures : null;
    const totalErrors = testReport ? testReport.totalErrors : null;
    const totalSkipped = testReport ? testReport.totalSkipped : null;
    const lineRate = coverageReport ? (Number(coverageReport.lineRate) * 100).toFixed(2) + '%' : null;
    const branchRate = coverageReport ? (Number(coverageReport.branchRate) * 100).toFixed(2) + '%' : null;

    jsonResponse.push({
      id: repo.id,
      name: repo.repoName,
      totalPassed,
      totalFailures,
      totalErrors,
      totalSkipped,
      lineRate,
      branchRate
    });
  });

  return res.json(jsonResponse);
}

async function getBranches(req, res) {
  const branches = await Branch.findAll({
    attributes: ['id', 'branchName'],
    where: {
      repoId: req.params.repoId
    },
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
  });

  if (!branches.length) {
    return res.status(404).json({ message: 'Branches not found' });
  }

  const jsonResponse = [];
  branches.forEach(branch => {
    const testReport = branch.TestReports[0];
    const coverageReport = branch.CoverageReports[0];

    const totalPassed = testReport ? testReport.totalTests - testReport.totalFailures - testReport.totalErrors - testReport.totalSkipped : null;
    const totalFailures = testReport ? testReport.totalFailures : null;
    const totalErrors = testReport ? testReport.totalErrors : null;
    const totalSkipped = testReport ? testReport.totalSkipped : null;
    const lineRate = coverageReport ? (Number(coverageReport.lineRate) * 100).toFixed(2) + '%' : null;
    const branchRate = coverageReport ? (Number(coverageReport.branchRate) * 100).toFixed(2) + '%' : null;

    jsonResponse.push({
      id: branch.id,
      name: branch.branchName,
      totalPassed,
      totalFailures,
      totalErrors,
      totalSkipped,
      lineRate,
      branchRate
    });
  });
  
  return res.json(jsonResponse);
}

module.exports = { getRepos, getBranches };