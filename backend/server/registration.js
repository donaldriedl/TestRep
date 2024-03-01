const bcrypt = require('bcrypt');
const { v4 } = require('uuid');
const Organization = require('../models/organization.js');
const User = require('../models/user.js');

async function createUser(req, res) {
    const { email, password, orgName } = req.body;

    try {
      const randomUuid = v4();
      const organization = new Organization({ organizationName: orgName, organizationUuid: randomUuid });
      await organization.save();

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new User({ email, pass: hashedPassword, organizationId: organization.id });
      await user.save();

      res.sendStatus(201, 'User created');
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: 'Organization or email already exists' });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
}

async function getOrganizations(req, res) {
  const organizations = await Organization.findByPk(req.user.organizationId);
  if (!organizations.length) {
    return res.status(404).json({ message: 'No organizations found' });
  }
  return res.json({ organizations });
}

async function getOrganizationByUuid(uuid) {
  const organization = await Organization.findOne({ where: { organizationUuid: uuid } });
  return organization;
}

module.exports = { createUser, getOrganizations, getOrganizationByUuid };
