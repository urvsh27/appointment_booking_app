'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SpecialSchedules extends Model {
    static associate(models) {
      SpecialSchedules.belongsTo(models.users);
    }
  }
  SpecialSchedules.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
      },
      statusType: {
        type: DataTypes.ENUM('available', 'unavailable'),
        allowNull: true,
      },
      date: {
        type: DataTypes.STRING,
        allowNull: true,
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
      modelName: 'special_schedules',
      indexes: [
        {
          fields: ['id'],
          using: 'BTREE',
          name: 'special_schedules_id_btree_index',
        },
        {
          fields: ['statusType'],
          using: 'BTREE',
          name: 'special_schedules_statusType_btree_index',
        },
        {
          fields: ['date'],
          using: 'BTREE',
          name: 'special_schedules_date_btree_index',
        },
        {
          fields: ['startTime'],
          using: 'BTREE',
          name: 'special_schedules_startTime_btree_index',
        },
        {
          fields: ['endTime'],
          using: 'BTREE',
          name: 'special_schedules_endTime_btree_index',
        },
      ],
    }
  );
  return SpecialSchedules;
};
