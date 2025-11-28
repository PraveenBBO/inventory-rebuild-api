'use strict';
const {Model} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Product extends Model {
        static associate(models) {
            Product.belongsTo(models.ProductCategory, {
                foreignKey: 'category_id',
                as: 'category',
                onDelete: 'CASCADE'
            });

            Product.hasMany(models.InventoryOrderProduct, {
                foreignKey: 'product_id',
                as: 'product',
            });

            Product.hasMany(models.ProductLog, {
                foreignKey: 'product_id',
                as: 'logs',
                onDelete: 'CASCADE',
            });

        }
    }

    Product.init({
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        sku: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        sku_combo: {
            type: DataTypes.STRING,
            allowNull: true
        },
        cost: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0
        },
        quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        order_received: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        threshold: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        location: {
            type: DataTypes.STRING,
            allowNull: true
        },
        note: {
            type: DataTypes.STRING,
            allowNull: true
        },
        photo: {
            type: DataTypes.STRING,
            allowNull: true
        },
        china_quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        china_threshold: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        china_photo: {
            type: DataTypes.STRING,
            allowNull: true
        },
        china_location: {
            type: DataTypes.STRING,
            allowNull: true
        },
        china_note: {
            type: DataTypes.STRING,
            allowNull: true
        },
        length: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        width: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        height: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        unit_cbm: {
            type: DataTypes.DECIMAL(10, 3),
            defaultValue: 0
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active'
        },
        archive: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        sequelize,
        modelName: 'Product',
        tableName: 'products',
        timestamps: true
    });

    return Product;
};