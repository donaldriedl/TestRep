const Repo = require('../models/repo.js');
const Branch = require('../models/branch.js');
const TestReport = require('../models/test_report.js');
const CoverageReport = require('../models/coverage_report.js');

async function getRepos(req, res) {
  const repos = await Repo.findAll({
    attributes: ['id', 'repoName'],
    where: {
      organizationId: req.user.defaultOrgId,
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
    attributes: ['id', 'branchName', 'isPrimary'],
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
      isPrimary: branch.isPrimary,
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

async function getBranchIdByName(branchName, repoName, orgId) {
  const repo = await Repo.findOne({
    attributes: ['id'],
    where: {
      organizationId: orgId,
      repoName,
    }
  });

  if (!repo) {
    return null;
  }

  const branch = await Branch.findOne({
    attributes: ['id'],
    where: {
      repoId: repo.id,
      branchName
    }
  });

  return branch.id;
}

async function getPrimaryBranchId(repoName, orgId) {
  const repo = await Repo.findOne({
    attributes: ['id'],
    where: {
      organizationId: orgId,
      repoName,
    }
  });

  if (!repo) {
    return null;
  }

  const branch = await Branch.findOne({
    attributes: ['id'],
    where: {
      repoId: repo.id,
      isPrimary: true
    }
  });

  return branch.id;
}

async function updatePrimaryBranch(req, res) {
  const branchId = req.body.primaryBranch;
  const branch = await Branch.findOne({
    where: {
      id: branchId
    }
  });

  const repo = await Repo.findOne({
    where: {
      id: branch.repoId,
      organizationId: req.user.defaultOrgId,
    }
  });

  if (!branch || !repo) {
    return res.status(404).json({ message: 'Branch not found' });
  }

  await Branch.update({ isPrimary: false }, {
    where: {
      repoId: branch.repoId
    }
  });

  await Branch.update({ isPrimary: true }, {
    where: {
      id: branchId
    }
  });

  return res.json({ message: 'Primary branch updated' });
}

module.exports = { getRepos, getBranches, getBranchIdByName, getPrimaryBranchId, updatePrimaryBranch };