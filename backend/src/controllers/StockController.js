const StockService = require("../services/StockService");
const ResponseFormatter = require("../utils/ResponseFormatter");

class StockController {
  static async getStockLevels(req, res, next) {
    try {
      const { warehouse_id, product_id } = req.query;

      const filters = {};
      if (warehouse_id) filters.warehouse_id = warehouse_id;
      if (product_id) filters.product_id = product_id;

      const stocks = await StockService.getStockLevels(filters);

      const response = ResponseFormatter.success(
        "Stock levels retrieved successfully",
        stocks,
        200
      );

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StockController;
