const models = require("../models");
const { Op } = require("sequelize");

class StockService {
  static async getStockLevels(filters = {}) {
    try {
      const where = {};

      if (filters.warehouse_id) {
        where.warehouse_id = filters.warehouse_id;
      }

      if (filters.product_id) {
        where.product_id = filters.product_id;
      }

      const stocks = await models.Stock.findAll({
        where,
        include: [
          {
            model: models.Warehouse,
            as: "warehouse",
            attributes: ["id", "name"],
          },
          {
            model: models.Product,
            as: "product",
            attributes: ["id", "name", "sku"],
          },
        ],
        order: [["warehouse_id", "ASC"]],
      });

      return stocks;
    } catch (error) {
      console.error("Error fetching stock levels:", error);
      throw error;
    }
  }

  static async updateStockQuantity(warehouseId, productId, quantityToAdd) {
    const transaction = await models.sequelize.transaction();

    try {
      // Find or create stock record
      const [stock, created] = await models.Stock.findOrCreate({
        where: {
          warehouse_id: warehouseId,
          product_id: productId,
        },
        defaults: {
          quantity: quantityToAdd,
        },
        transaction,
      });

      if (!created) {
        // Update existing stock
        stock.quantity += quantityToAdd;
        await stock.save({ transaction });
      }

      await transaction.commit();
      return stock;
    } catch (error) {
      await transaction.rollback();
      console.error("Error updating stock quantity:", error);
      throw error;
    }
  }
}

module.exports = StockService;
