'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Dailyoffs extends Model {
    static associate(models) {
      Dailyoffs.belongsTo(models.users);
    }
  }
  Dailyoffs.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
      },
      startTime: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      endTime: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'dailyoffs',
      indexes: [
        {
          fields: ['id'],
          using: 'BTREE',
          name: 'dailyoffs_id_btree_index',
        },
        {
          fields: ['startTime'],
          using: 'BTREE',
          name: 'dailyoffs_startTime_btree_index',
        },
        {
          fields: ['endTime'],
          using: 'BTREE',
          name: 'dailyoffs_endTime_btree_index',
        },
      ],
    }
  );
  return Dailyoffs;
};
