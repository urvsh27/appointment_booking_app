'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate() {}
  }
  Users.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      activated: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true, 
      },
      deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'users',
      indexes: [
        {
          unique: true,
          name: 'users_unique_index',
          fields: ['email'],
        },
        {
          fields: ['id'],
          using: 'BTREE',
          name: 'users_id_btree_index',
        },
        {
          fields: ['name'],
          using: 'BTREE',
          name: 'users_name_btree_index',
        },
        {
          fields: ['activated'],
          using: 'BTREE',
          name: 'users_activated_btree_index',
        },
        {
          fields: ['deleted'],
          using: 'BTREE',
          name: 'users_deleted_btree_index',
        },
      ],
    }
  );
  return Users;
};
