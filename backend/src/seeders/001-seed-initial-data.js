"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface, Sequelize) {
    const warehouseIds = [uuidv4(), uuidv4(), uuidv4()];

    await queryInterface.bulkInsert("warehouses", [
      {
        id: warehouseIds[0],
        name: "Jakarta Warehouse",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: warehouseIds[1],
        name: "Surabaya Warehouse",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: warehouseIds[2],
        name: "Bandung Warehouse",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const productIds = [uuidv4(), uuidv4(), uuidv4(), uuidv4(), uuidv4()];

    await queryInterface.bulkInsert("products", [
      {
        id: productIds[0],
        name: "Icy Mint",
        sku: "ICYMINT",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: productIds[1],
        name: "Fresh Lemon",
        sku: "FRESHLEMON",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: productIds[2],
        name: "Strawberry Bliss",
        sku: "STRAWBLISS",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: productIds[3],
        name: "Vanilla Dream",
        sku: "VANADREAM",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: productIds[4],
        name: "Icy Watermelon",
        sku: "ICYWATERMELON",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Create initial stock entries
    const stockData = [];
    for (let i = 0; i < warehouseIds.length; i++) {
      for (let j = 0; j < productIds.length; j++) {
        stockData.push({
          id: uuidv4(),
          warehouse_id: warehouseIds[i],
          product_id: productIds[j],
          quantity: Math.floor(Math.random() * 100) + 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    await queryInterface.bulkInsert("stocks", stockData);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("stocks", null, {});
    await queryInterface.bulkDelete("products", null, {});
    await queryInterface.bulkDelete("warehouses", null, {});
  },
};
