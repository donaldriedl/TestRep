const express = require('express');
const cors = require('cors');
const session = require('express-session');
const multer = require('multer');
const passport = require('./server/middleware.js');
const { createOrganization, createUser, getOrganizations, getOrganizationByUuid, updateDefaultOrganization } = require('./server/registration.js');
const { getRepos, getBranches, updatePrimaryBranch } = require('./server/repos.js');
const { getTestReports, getTestDetails, insertTests } = require('./server/tests.js');
const { getCoverageReports, getCoverageDetails, uploadCoverageReport } = require('./server/coverage.js');
const { getOrganizationSummary, getRepoSummary, getBranchSummary, getBranchCompare } = require('./server/reports.js');

const app = express();
const port = 3001;
const storage = multer.memoryStorage();
const upload = multer({ storage });

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize())
app.use(passport.session())

/**
 * Sessions and Users
 */
app.post('/session', passport.authenticate('local'), (req, res) => {
  if (req.user) {
    res.status(201).json({ 
      email: req.user.email,
      organizationId: req.user.organizationId
    });
  }
});

app.get('/session', (req, res) => {
  if (req.user) {
    res.json({
      email: req.user.email,
      defaultOrgId: req.user.defaultOrgId,
    });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

app.delete('/session', (req, res) => {
  req.logout(() => {});
  res.sendStatus(200);
});

app.post('/register', (req, res) => {
  createUser(req, res);
});

/**
 * Organizations, Repos and Branches
 */
app.post('/organizations', (req, res) => {
  createOrganization(req, res);
});

app.post('/organizations/:orgId', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  updateDefaultOrganization(req, res);
})

app.get('/organizations', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  getOrganizations(req, res);
});

app.get('/organizations/summary', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  getOrganizationSummary(req, res);
});

app.get('/repos', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  getRepos(req, res);
});

app.get('/repos/:repoId/summary', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  getRepoSummary(req, res);
});

app.get('/repos/:repoId/branches', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  getBranches(req, res);
});

app.put('/repos/:repoId/branches', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  updatePrimaryBranch(req, res);
});

/**
 * Test Reports and Test Details
 */
app.get('/branches/:branchId/summary', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  getBranchSummary(req, res);
});

app.get('/branches/:branchId/tests', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  getTestReports(req, res);
});

app.get('/tests/:reportId', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  getTestDetails(req, res);
});

app.post('/:repoName/:branchName/tests', upload.single('file'), async (req, res) => {
  const uuid = req.headers['x-organization-uuid'];
  if (!uuid) {
    return res.status(400).json({ message: 'Organization UUID is required' });
  }
  const organization = await getOrganizationByUuid(uuid);
  if (!organization) {
    return res.status(404).json({ message: 'Organization not found' });
  }
  insertTests(req, res, organization.id);
});

/**
 * Coverage Reports and Coverage Details
 */
app.get('/branches/:branchId/coverage', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  getCoverageReports(req, res);
});

app.get('/coverage/:reportId', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  getCoverageDetails(req, res);
});

app.post('/:repoName/:branchName/coverage', upload.single('file'), async (req, res) => {
  const uuid = req.headers['x-organization-uuid'];
  if (!uuid) {
    return res.status(400).json({ message: 'Organization UUID is required' });
  }
  const organization = await getOrganizationByUuid(uuid);
  if (!organization) {
    return res.status(404).json({ message: 'Organization not found' });
  }
  uploadCoverageReport(req, res, organization.id);
});

/**
 * Compare Branches
 */
app.get('/:repoName/:branchName/compare', async (req, res) => {
  const uuid = req.headers['x-organization-uuid'];
  if (!uuid) {
    return res.status(400).json({ message: 'Organization UUID is required' });
  }
  const organization = await getOrganizationByUuid(uuid);
  if (!organization) {
    return res.status(404).json({ message: 'Organization not found' });
  }
  getBranchCompare(req, res, organization.id);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
