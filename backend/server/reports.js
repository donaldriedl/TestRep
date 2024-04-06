const { getBranchIdByName, getPrimaryBranchId } = require('./repos.js');
const { compareBranchTests, getOrganizationTestSummary, getRepoTestSummary, getBranchTestSummary } = require('./tests.js');
const { compareBranchCoverage, getOrganizationCoverageSummary, getRepoCoverageSummary, getBranchCoverageSummary } = require('./coverage.js');

async function getOrganizationSummary(req, res) {
  const tests = await getOrganizationTestSummary(req);
  const coverage = await getOrganizationCoverageSummary(req);
  res.json({ tests, coverage });
}

async function getRepoSummary(req, res) {
  const tests = await getRepoTestSummary(req);
  const coverage = await getRepoCoverageSummary(req);
  res.json({ tests, coverage });
}

async function getBranchSummary(req, res) {
  const tests = await getBranchTestSummary(req);
  const coverage = await getBranchCoverageSummary(req);
  res.json({ tests, coverage });
}

async function getBranchCompare(req, res, orgId) {
  const primaryBranchId = await getPrimaryBranchId(req.params.repoName, orgId);
  console.log(`primaryBranchId: ${primaryBranchId}`)
  const branchId = await getBranchIdByName(req.params.branchName, req.params.repoName, orgId);
  if (!primaryBranchId) {
    return res.status(404).json({ message: 'Primary branch not found' });
  }

  if (req.params.branchId === primaryBranchId) {
    return res.status(400).json({ message: 'Cannot compare a branch to itself' });
  }

  const tests = await compareBranchTests(branchId, primaryBranchId, orgId);
  const coverage = await compareBranchCoverage(branchId, primaryBranchId, orgId);
  res.json({ tests, coverage });
}

module.exports = {
  getOrganizationSummary,
  getRepoSummary,
  getBranchSummary,
  getBranchCompare
}