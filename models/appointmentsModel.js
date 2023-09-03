'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Appointments extends Model {
    static associate(models) {
      Appointments.belongsTo(models.users);
    }
  }
  Appointments.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      agenda: {
        type: DataTypes.STRING,
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
      guestId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'appointments',
      indexes: [
        {
          fields: ['id'],
          using: 'BTREE',
          name: 'appointments_id_btree_index',
        },
        {
          fields: ['title'],
          using: 'BTREE',
          name: 'appointments_title_btree_index',
        },
        {
          fields: ['agenda'],
          using: 'BTREE',
          name: 'appointments_agenda_btree_index',
        },
        {
          fields: ['date'],
          using: 'BTREE',
          name: 'appointments_date_btree_index',
        },
        {
          fields: ['startTime'],
          using: 'BTREE',
          name: 'appointments_startTime_btree_index',
        },
        {
          fields: ['endTime'],
          using: 'BTREE',
          name: 'appointments_endTime_btree_index',
        },
        {
          fields: ['guestId'],
          using: 'BTREE',
          name: 'appointments_guestId_btree_index',
        },
      ],
    }
  );
  return Appointments;
};
