const bcrypt = require('bcrypt');
const { v4 } = require('uuid');
const { Op } = require('sequelize');
const Organization = require('../models/organization.js');
const User = require('../models/user.js');
const Membership = require('../models/membership.js');

async function createOrganization(req, res) {
  const { orgName } = req.body;

  try {
    const organization = new Organization({ organizationName: orgName, organizationUuid: v4() });
    await organization.save();
    res.status(201).json({ uuid: organization.organizationUuid });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Organization name already exists' });
    }
    console.log(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function createUser(req, res) {
    const { email, password, orgUuid } = req.body;

    try {
      const organization = await getOrganizationByUuid(orgUuid);
      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new User({ email, pass: hashedPassword, defaultOrgId: organization.id });
      await user.save();

      const membership = new Membership({ userId: user.id, organizationId: organization.id });
      await membership.save();

      res.sendStatus(201, 'User created');
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: 'Email already exists' });
      }
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
}

async function updateDefaultOrganization(req, res) {
  const orgId = req.params.orgId;

  try {
    const organization = await Organization.findByPk(orgId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    req.user.defaultOrgId = orgId;
    await req.user.save();

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function getOrganizations(req, res) {
  const orgIds = await Membership.findAll({ where: { userId: req.user.id }});
  if (!orgIds.length) {
    return res.status(404).json({ message: 'No organizations found' });
  }
  
  const organizations = await Organization.findAll({
    attributes: ['id', 'organizationName', 'organizationUuid'],
    where: { id: { [Op.in]: orgIds.map(org => org.organizationId)}}
  });
  if (!organizations.length) {
    return res.status(404).json({ message: 'No organizations found' });
  }
  
  return res.json(organizations);
}

async function getOrganizationByUuid(uuid) {
  const organization = await Organization.findOne({ where: { organizationUuid: uuid } });
  return organization;
}

module.exports = { createOrganization, createUser, getOrganizations, getOrganizationByUuid, updateDefaultOrganization };
