const models = require("../models");
const StockService = require("../services/StockService");
const PurchaseRequestService = require("../services/PurchaseRequestService");
const ResponseFormatter = require("../utils/ResponseFormatter");

class WebhookController {
  static async receiveStock(req, res, next) {
    try {
      const { vendor, reference, qty_total, details } = req.body;

      console.log("Webhook received body:", JSON.stringify(req.body, null, 2));
      console.log(
        "Vendor:",
        vendor,
        "| Reference:",
        reference,
        "| Details:",
        details
      );
      console.log("Expected vendor:", process.env.VENDOR_NAME);

      if (!vendor || !reference || !details) {
        const response = ResponseFormatter.error(
          "Validation failed",
          "Missing required fields: vendor, reference, details",
          400
        );
        return res.status(400).json(response);
      }

      if (vendor !== process.env.VENDOR_NAME) {
        console.log(
          `Vendor mismatch: received '${vendor}' vs expected '${process.env.VENDOR_NAME}'`
        );
        const response = ResponseFormatter.forbidden(
          `Vendor ${vendor} is not authorized`
        );
        return res.status(403).json(response);
      }

      if (!Array.isArray(details) || details.length === 0) {
        const response = ResponseFormatter.error(
          "Validation failed",
          "details must be a non-empty array",
          400
        );
        return res.status(400).json(response);
      }

      for (const detail of details) {
        if (!detail.sku_barcode || !detail.qty) {
          const response = ResponseFormatter.error(
            "Validation failed",
            "Each detail must have sku_barcode and qty",
            400
          );
          return res.status(400).json(response);
        }
      }

      const purchaseRequest =
        await PurchaseRequestService.getPurchaseRequestByReference(reference);

      if (!purchaseRequest) {
        const response = ResponseFormatter.notFound(
          `Purchase Request with reference ${reference}`
        );
        return res.status(404).json(response);
      }

      if (purchaseRequest.status === "COMPLETED") {
        const response = ResponseFormatter.conflict(
          "Stock for this Purchase Request has already been received",
          { reference, status: "Already processed" }
        );
        return res.status(409).json(response);
      }

      const processedItems = [];
      const transaction = await models.sequelize.transaction();

      try {
        for (const detail of details) {
          const product = await models.Product.findOne(
            {
              where: { sku: detail.sku_barcode },
            },
            { transaction }
          );

          if (!product) {
            await transaction.rollback();
            const response = ResponseFormatter.notFound(
              `Product with SKU ${detail.sku_barcode}`
            );
            return res.status(404).json(response);
          }

          const stock = await StockService.updateStockQuantity(
            purchaseRequest.warehouse_id,
            product.id,
            detail.qty
          );

          processedItems.push({
            product_id: product.id,
            product_name: product.name,
            sku: detail.sku_barcode,
            quantity_added: detail.qty,
            new_total: stock.quantity,
          });
        }

        purchaseRequest.status = "COMPLETED";
        await purchaseRequest.save({ transaction });

        await transaction.commit();

        const response = ResponseFormatter.success(
          "Stock received successfully",
          {
            reference,
            warehouse_id: purchaseRequest.warehouse_id,
            status: purchaseRequest.status,
            items_processed: processedItems,
            total_quantity: qty_total,
          },
          200
        );

        res.status(200).json(response);
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = WebhookController;
