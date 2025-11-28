'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ProductCategory extends Model {
        static associate(models) {
            // define association here
        }
    }

    ProductCategory.init({
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            order_no: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            status: {
                type: DataTypes.ENUM("active", "inactive"),
                allowNull: false,
                defaultValue: "active",
            }
        }
        , {
            sequelize,
            modelName: 'ProductCategory',
            tableName: 'product_categories',
            timestamps: true,
            underscored: true,
            paranoid: true,
        });
    return ProductCategory;
};