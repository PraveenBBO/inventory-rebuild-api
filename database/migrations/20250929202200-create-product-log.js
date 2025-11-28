'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('product_logs', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            product_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                onDelete: 'CASCADE',
                references: {
                    model: 'products',
                    key: 'id',
                },
            },
            action: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            detail: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            is_for: {
                type: Sequelize.ENUM('usa', 'china'),
                allowNull: false,
            },
            created_by: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            deleted_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
        });
        // Optional index to speed up lookups by product and region
        await queryInterface.addIndex('product_logs', ['product_id']);
        await queryInterface.addIndex('product_logs', ['is_for']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('product_logs');
    },
};