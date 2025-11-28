'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class InventoryOrderProduct extends Model {
    static associate(models) {
      InventoryOrderProduct.belongsTo(models.InventoryOrder, {
        foreignKey: 'inventory_order_id',
        as: 'inventoryOrder'
      });
      InventoryOrderProduct.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product',
      });
    }
  }

  InventoryOrderProduct.init({
    inventory_order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ctn: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unit_cbm: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'InventoryOrderProduct',
    tableName: 'inventory_order_products',
    timestamps: true,
  });

  return InventoryOrderProduct;
};