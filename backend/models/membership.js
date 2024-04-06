const { DataTypes } = require('sequelize');
const sequelize = require('../database.js');
const Organization = require('./organization.js');
const User = require('./user.js');

const Membership = sequelize.define('Membership', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
    organizationId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

Membership.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Membership, { foreignKey: 'userId' });

Membership.belongsTo(Organization, { foreignKey: 'organizationId' });
Organization.hasMany(Membership, { foreignKey: 'organizationId' });

module.exports = Membership;