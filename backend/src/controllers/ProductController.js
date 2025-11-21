const models = require("../models");
const ResponseFormatter = require("../utils/ResponseFormatter");

class ProductController {
  static async getAllProducts(req, res, next) {
    try {
      const products = await models.Product.findAll({
        attributes: ["id", "name", "sku"],
        order: [["name", "ASC"]],
      });

      const response = ResponseFormatter.success(
        "Products retrieved successfully",
        products,
        200
      );

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductController;
