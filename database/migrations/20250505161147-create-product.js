'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('products', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            category_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                onDelete: 'CASCADE',
                references: {
                    model: 'product_categories',
                    key: 'id'
                },
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            sku: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            sku_combo: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            cost: {
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0
            },
            quantity: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            order_received: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            threshold: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            location: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            note: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            photo: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            china_quantity: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            china_threshold: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            china_photo: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            china_location: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            china_note: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            length: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            width: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            height: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            unit_cbm: {
                type: Sequelize.DECIMAL(10, 3),
                defaultValue: 0,
            },
            status: {
                type: Sequelize.ENUM('active', 'inactive'),
                defaultValue: 'active'
            },
            archive: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            deleted_at: {
                type: Sequelize.DATE,
                allowNull: true,
            }
        });
        await queryInterface.sequelize.query(
            `CREATE UNIQUE INDEX unique_lower_sku ON products (LOWER(sku));`
        );
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('products');
    }
};