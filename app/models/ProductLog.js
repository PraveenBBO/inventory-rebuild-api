"use strict";
const {Model} = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class ProductLog extends Model {
        static associate(models) {
            ProductLog.belongsTo(models.Product, {
                foreignKey: "product_id",
                as: "product",
                onDelete: "CASCADE",
            });
        }
    }

    ProductLog.init(
        {
            product_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            action: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            detail: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            is_for: {
                type: DataTypes.ENUM("usa", "china"),
                allowNull: false,
            },
            created_by: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "ProductLog",
            tableName: "product_logs",
            timestamps: true,
        }
    );

    return ProductLog;
};