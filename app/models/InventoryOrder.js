'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class InventoryOrder extends Model {
    static associate(models) {
      InventoryOrder.hasMany(models.InventoryOrderProduct, {
        foreignKey: 'inventory_order_id',
        as: 'products',
      });
    }
  }

  InventoryOrder.init({
    order_no: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM(
          "Processing",
          "Approved",
          "Production",
          "On the way",
          "Import into inventory",
          "Complete",
          "Pending",
          "Archive"
      ),
      allowNull: false,
      defaultValue: "Processing",
    },
    loading_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    etd: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    eta: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'InventoryOrder',
    tableName: 'inventory_orders',
    timestamps: true
  });

  return InventoryOrder;
};