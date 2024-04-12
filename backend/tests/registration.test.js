const { v4 } = require('uuid');
const { createOrganization, createUser, getOrganizations, joinOrganization, updateDefaultOrganization } = require('../server/registration.js');
const Organization = require('../models/organization.js');
const Membership = require('../models/membership.js');
const User = require('../models/user.js');

describe('createUser', () => {
  beforeEach(() => {
    req = {
      body: {
        email: 'test@example.com',
        password: 'password123',
        orgUuid: v4(),
      },
    };

    res = {
      sendStatus: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create a new user successfully', async () => {
    organizationFindOneMock = jest.spyOn(Organization, 'findOne').mockResolvedValue({ id: 1 });
    saveUserMock = jest.spyOn(User.prototype, 'save').mockResolvedValue();
    saveMembershipMock = jest.spyOn(Membership.prototype, 'save').mockResolvedValue();

    await createUser(req, res);

    expect(saveUserMock).toHaveBeenCalledTimes(1);
    expect(saveMembershipMock).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'User created successfully' });
  });

  it('should handle organization not found and return 404', async () => {
    organizationFindOneMock = jest.spyOn(Organization, 'findOne').mockResolvedValue(null);

    await createUser(req, res);

    expect(organizationFindOneMock).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Organization not found' });
  });

  it('should handle SequelizeUniqueConstraintError and return 400', async () => {
    organizationFindOneMock = jest.spyOn(Organization, 'findOne').mockResolvedValue({ id: 1 });
    saveUserMock = jest.spyOn(User.prototype, 'save').mockRejectedValue({ name: 'SequelizeUniqueConstraintError' });
    const statusMock = jest.spyOn(res, 'status');
    const jsonMock = jest.spyOn(res, 'json');

    await createUser(req, res);

    expect(organizationFindOneMock).toHaveBeenCalledTimes(1);
    expect(saveUserMock).toHaveBeenCalledTimes(1);
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Email already exists' });
  });

  it('should handle other errors and return 500', async () => {
    organizationFindOneMock = jest.spyOn(Organization, 'findOne').mockResolvedValue({ id: 1 });
    saveUserMock = jest.spyOn(User.prototype, 'save').mockRejectedValue(new Error('Some other error'));
    const statusMock = jest.spyOn(res, 'status');
    const jsonMock = jest.spyOn(res, 'json');

    await createUser(req, res);

    expect(organizationFindOneMock).toHaveBeenCalledTimes(1);
    expect(saveUserMock).toHaveBeenCalledTimes(1);
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});

describe('getOrganizations', () => {
  beforeEach(() => {
    req = {
      user: {
        id: 1,
      },
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return organizations successfully', async () => {
    const orgUuids = [v4(), v4()];
    const memberships = [
      { userId: 1, organizationId: 1 },
      { userId: 1, organizationId: 2 },
    ];

    const organizations = [
      { 
        id: 1,
        organizationName: 'Org1',
        organizationUuid: orgUuids[0],
      },
      {
        id: 2,
        organizationName: 'Org2',
        organizationUuid: orgUuids[1],
      }
    ];
    findAllMembershipsMock = jest.spyOn(Membership, 'findAll').mockResolvedValue(memberships);
    findAllOrganizationsMock = jest.spyOn(Organization, 'findAll').mockResolvedValue(organizations);

    await getOrganizations(req, res);

    expect(findAllMembershipsMock).toHaveBeenCalledTimes(1);
    expect(findAllOrganizationsMock).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(organizations);
  });

  it('should handle memberships not found and return 404', async () => {
    findAllMembershipsMock = jest.spyOn(Membership, 'findAll').mockResolvedValue([]);

    await getOrganizations(req, res);

    expect(findAllMembershipsMock).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'No organizations found' });
  });

  it('should handle organization not found and return 404', async () => {
    findAllMembershipsMock = jest.spyOn(Membership, 'findAll').mockResolvedValue([1]);
    findAllOrganizationsMock = jest.spyOn(Organization, 'findAll').mockResolvedValue([]);

    await getOrganizations(req, res);

    expect(findAllMembershipsMock).toHaveBeenCalledTimes(1);
    expect(findAllOrganizationsMock).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'No organizations found' });
  });
});

describe('createOrganization', () => {
  beforeEach(() => {
    req = {
      body: { orgName: 'Test Org' },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create organization successfully', async () => {
    saveOrganizationMock = jest.spyOn(Organization.prototype, 'save').mockResolvedValue();

    await createOrganization(req, res);

    expect(saveOrganizationMock).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ uuid: expect.anything() });
  });

  it('should handle duplicate value insertion and return 400', async () => {
    saveOrganizationMock = jest.spyOn(Organization.prototype, 'save').mockRejectedValue({ name: 'SequelizeUniqueConstraintError' });

    await createOrganization(req, res);

    expect(saveOrganizationMock).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Organization name already exists' });
  });

  it('should handle errors and return 500', async () => {
    saveOrganizationMock = jest.spyOn(Organization.prototype, 'save').mockRejectedValue(new Error('Some error'));

    await createOrganization(req, res);

    expect(saveOrganizationMock).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});

describe('updateDefaultOrganization', () => {
  beforeEach(() => {
    req = {
      params: { orgId: 1 },
      user: {
        defaultOrgId: 2,
        save: jest.fn(),
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should update default organization successfully', async () => {
    orgFindOneMock = jest.spyOn(Organization, 'findByPk').mockResolvedValue({ id: 1 });

    await updateDefaultOrganization(req, res);

    expect(req.user.defaultOrgId).toBe(1);
    expect(req.user.save).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Default organization updated successfully' });
  });

  it('should handle organization not found and return 404', async () => {
    orgFindOneMock = jest.spyOn(Organization, 'findByPk').mockResolvedValue(null);

    await updateDefaultOrganization(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Organization not found' });
  });

  it('should handle errors and return 500', async () => {
    orgFindOneMock = jest.spyOn(Organization, 'findByPk').mockRejectedValue(new Error('Some error'));

    await updateDefaultOrganization(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});

describe('joinOrganization', () => {
  beforeEach(() => {
    req = {
      body: { organizationUuid: v4() },
      user: { id: 1 },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should join organization successfully', async () => {
    getOrganizationByUuidMock = jest.spyOn(Organization, 'findOne').mockResolvedValue({ id: 1 });
    saveMembershipMock = jest.spyOn(Membership.prototype, 'save').mockResolvedValue();

    await joinOrganization(req, res);

    expect(saveMembershipMock).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'User joined organization successfully' });
  });

  it('should handle organization not found and return 404', async () => {
    getOrganizationByUuidMock = jest.spyOn(Organization, 'findOne').mockResolvedValue(null);

    await joinOrganization(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Organization not found' });
  });

  it('should handle errors and return 500', async () => {
    getOrganizationByUuidMock = jest.spyOn(Organization, 'findOne').mockRejectedValue(new Error('Some error'));

    await joinOrganization(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});