const { createUser, getOrganizations } = require('../server/registration.js');
const Organization = require('../models/organization.js');
const User = require('../models/user.js');

describe('createUser', () => {
  let req, res;
  let saveOrganizationMock, saveUserMock;

  beforeEach(() => {
    req = {
      body: {
        email: 'test@example.com',
        password: 'password123',
        orgName: 'TestOrg',
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
    saveOrganizationMock = jest.spyOn(Organization.prototype, 'save').mockResolvedValue();
    saveUserMock = jest.spyOn(User.prototype, 'save').mockResolvedValue();
    await createUser(req, res);

    // Your assertions here using expect and jest.assertions
    expect(saveOrganizationMock).toHaveBeenCalledTimes(1);
    expect(saveUserMock).toHaveBeenCalledTimes(1);
    expect(saveOrganizationMock).toHaveBeenCalled();
    expect(saveUserMock).toHaveBeenCalled();
  });

  it('should handle SequelizeUniqueConstraintError and return 400', async () => {
    jest.spyOn(Organization.prototype, 'save').mockRejectedValue({ name: 'SequelizeUniqueConstraintError' });
    const statusMock = jest.spyOn(res, 'status');
    const jsonMock = jest.spyOn(res, 'json');

    await createUser(req, res);

    expect(Organization.prototype.save).toHaveBeenCalledTimes(1);
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Organization or email already exists' });
  });

  it('should handle other errors and return 500', async () => {
    jest.spyOn(Organization.prototype, 'save').mockRejectedValue(new Error('Some other error'));
    const statusMock = jest.spyOn(res, 'status');
    const jsonMock = jest.spyOn(res, 'json');

    await createUser(req, res);

    expect(Organization.prototype.save).toHaveBeenCalledTimes(1);
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});

describe('getOrganizations', () => {
  let req, res;
  let findByPkMock;

  beforeEach(() => {
    req = {
      user: {
        organizationId: 1,
      },
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      sendStatus: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return organizations successfully', async () => {
    const organizations = [{ name: 'Org1' }, { name: 'Org2' }];
    findByPkMock = jest.spyOn(Organization, 'findByPk').mockResolvedValue(organizations);
    const jsonMock = jest.spyOn(res, 'json');

    await getOrganizations(req, res);

    expect(findByPkMock).toHaveBeenCalledTimes(1);
    expect(jsonMock).toHaveBeenCalledWith({ organizations });
  });

  it('should handle organization not found and return 404', async () => {
    findByPkMock = jest.spyOn(Organization, 'findByPk').mockResolvedValue([]);
    const statusMock = jest.spyOn(res, 'status');
    const jsonMock = jest.spyOn(res, 'json');

    await getOrganizations(req, res);

    expect(findByPkMock).toHaveBeenCalledTimes(1);
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'No organizations found' });
  });
});