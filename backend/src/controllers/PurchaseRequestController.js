const PurchaseRequestService = require("../services/PurchaseRequestService");
const models = require("../models");
const ResponseFormatter = require("../utils/ResponseFormatter");
const { v4: uuidv4 } = require("uuid");

class PurchaseRequestController {
  static async getAllPurchaseRequests(req, res, next) {
    try {
      const purchaseRequests = await models.PurchaseRequest.findAll({
        include: [
          { model: models.Warehouse, as: "warehouse", attributes: ["id", "name"] },
          {
            model: models.PurchaseRequestItem,
            as: "items",
            include: [
              { model: models.Product, attributes: ["id", "name", "sku"] },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      const response = ResponseFormatter.success(
        "Purchase Requests retrieved successfully",
        purchaseRequests,
        200
      );

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getPurchaseRequestById(req, res, next) {
    try {
      const { id } = req.params;

      const purchaseRequest = await models.PurchaseRequest.findByPk(id, {
        include: [
          { model: models.Warehouse, as: "warehouse", attributes: ["id", "name"] },
          {
            model: models.PurchaseRequestItem,
            as: "items",
            include: [
              { model: models.Product, attributes: ["id", "name", "sku"] },
            ],
          },
        ],
      });

      if (!purchaseRequest) {
        const response = ResponseFormatter.notFound("Purchase Request");
        return res.status(404).json(response);
      }

      const response = ResponseFormatter.success(
        "Purchase Request retrieved successfully",
        purchaseRequest,
        200
      );

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async createPurchaseRequest(req, res, next) {
    try {
      const { warehouse_id, items } = req.body;

      if (!warehouse_id) {
        const response = ResponseFormatter.error(
          "Validation failed",
          "warehouse_id is required",
          400
        );
        return res.status(400).json(response);
      }

      if (!Array.isArray(items) || items.length === 0) {
        const response = ResponseFormatter.error(
          "Validation failed",
          "items must be a non-empty array",
          400
        );
        return res.status(400).json(response);
      }

      for (const item of items) {
        if (!item.product_id || !item.quantity) {
          const response = ResponseFormatter.error(
            "Validation failed",
            "Each item must have product_id and quantity",
            400
          );
          return res.status(400).json(response);
        }
      }

      const warehouse = await models.Warehouse.findByPk(warehouse_id);
      if (!warehouse) {
        const response = ResponseFormatter.notFound("Warehouse");
        return res.status(404).json(response);
      }

      for (const item of items) {
        const product = await models.Product.findByPk(item.product_id);
        if (!product) {
          const response = ResponseFormatter.notFound(
            `Product with id ${item.product_id}`
          );
          return res.status(404).json(response);
        }
      }

      const reference = this.generateReference();

      const purchaseRequest =
        await PurchaseRequestService.createPurchaseRequest(
          reference,
          warehouse_id,
          items
        );

      const response = ResponseFormatter.success(
        "Purchase Request created successfully",
        purchaseRequest,
        201
      );

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async updatePurchaseRequest(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;

      const purchaseRequest = await models.PurchaseRequest.findByPk(id);
      if (!purchaseRequest) {
        const response = ResponseFormatter.notFound("Purchase Request");
        return res.status(404).json(response);
      }

      if (purchaseRequest.status !== "DRAFT" && !data.status) {
        const response = ResponseFormatter.error(
          `Cannot update purchase request with status ${purchaseRequest.status}`,
          "Only DRAFT requests can be updated",
          400
        );
        return res.status(400).json(response);
      }

      if (data.items && Array.isArray(data.items)) {
        for (const item of data.items) {
          if (!item.product_id || !item.quantity) {
            const response = ResponseFormatter.error(
              "Validation failed",
              "Each item must have product_id and quantity",
              400
            );
            return res.status(400).json(response);
          }

          const product = await models.Product.findByPk(item.product_id);
          if (!product) {
            const response = ResponseFormatter.notFound(
              `Product with id ${item.product_id}`
            );
            return res.status(404).json(response);
          }
        }
      }

      if (data.warehouse_id) {
        const warehouse = await models.Warehouse.findByPk(data.warehouse_id);
        if (!warehouse) {
          const response = ResponseFormatter.notFound("Warehouse");
          return res.status(404).json(response);
        }
      }

      const updatedRequest = await PurchaseRequestService.updatePurchaseRequest(
        id,
        data
      );

      const response = ResponseFormatter.success(
        "Purchase Request updated successfully",
        updatedRequest,
        200
      );

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async deletePurchaseRequest(req, res, next) {
    try {
      const { id } = req.params;

      const purchaseRequest = await models.PurchaseRequest.findByPk(id);
      if (!purchaseRequest) {
        const response = ResponseFormatter.notFound("Purchase Request");
        return res.status(404).json(response);
      }

      const result = await PurchaseRequestService.deletePurchaseRequest(id);

      const response = ResponseFormatter.success(
        "Purchase Request deleted successfully",
        null,
        200
      );

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static generateReference() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `PR${timestamp}${random}`;
  }
}

module.exports = PurchaseRequestController;
