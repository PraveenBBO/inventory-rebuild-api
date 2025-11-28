'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('inventory_orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      order_no: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      status: {
        type: Sequelize.ENUM(
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
        defaultValue: "Processing"
      },
      loading_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      etd: {
        type: Sequelize.DATE,
        allowNull: true
      },
      eta: {
        type: Sequelize.DATE,
        allowNull: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('inventory_orders');
  }
};