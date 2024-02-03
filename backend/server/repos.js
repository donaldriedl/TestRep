const Repo = require('../models/repo.js');
const Branch = require('../models/branch.js');

async function getRepos(req, res) {
  const repos = await Repo.findAll({
    attributes: ['id', 'repoName'],
    where: {
      organizationId: req.user.organizationId
    }
  });

  if (!repos.length) {
    return res.status(404).json({ message: 'Repos not found' });
  }

  return res.json({ repos });
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