const express = require('express');
const cors = require('cors');
const session = require('express-session');
const multer = require('multer');
const passport = require('./server/middleware.js');
const { createUser, getOrganizations } = require('./server/registration.js');
const { getRepos, getBranches } = require('./server/repos.js');
const { getTestReports, getTestDetails, insertTests } = require('./server/tests.js');
const { getCoverageReports, getCoverageDetails, uploadCoverageReport } = require('./server/coverage.js');
const { getOrganizationSummary } = require('./server/reports.js');

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
  res.sendStatus(201);
});

app.get('/session', (req, res) => {
  console.log(req.user);
  if (req.user) {
    res.json({ 
      email: req.user.email,
      organizationId: req.user.organizationId
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

app.get('/repos/:repoId/branches', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  getBranches(req, res);
});

/**
 * Test Reports and Test Details
 */
app.get('/repos/:repoId/branches/:branchId/tests', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  getTestReports(req, res);
});

app.get('/repos/:repoId/branches/:branchId/tests/:reportId/details', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  getTestDetails(req, res);
});

app.post('/repos/:repoName/branches/:branchName/tests', upload.single('file'), (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  insertTests(req, res);
});

/**
 * Coverage Reports and Coverage Details
 */
app.get('/repos/:repoId/branches/:branchId/coverage', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  getCoverageReports(req, res);
});

app.get('/repos/:repoId/branches/:branchId/coverage/:reportId/details', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  getCoverageDetails(req, res);
});

app.post('/repos/:repoName/branches/:branchName/coverage', upload.single('file'), (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  uploadCoverageReport(req, res);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
