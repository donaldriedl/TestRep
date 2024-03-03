const { getOrganizationTestSummary, getRepoTestSummary, getBranchTestSummary } = require('./tests.js');
const { getOrganizationCoverageSummary, getRepoCoverageSummary, getBranchCoverageSummary } = require('./coverage.js');

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

module.exports = {
  getOrganizationSummary,
  getRepoSummary,
  getBranchSummary
}