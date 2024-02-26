const { getOrganizationTestSummary } = require('./tests.js');
const { getOrganizationCoverageSummary } = require('./coverage.js');

async function getOrganizationSummary(req, res) {
  const tests = await getOrganizationTestSummary(req);
  const coverage = await getOrganizationCoverageSummary(req);
  res.json({ tests, coverage });
}

module.exports = {
  getOrganizationSummary
}