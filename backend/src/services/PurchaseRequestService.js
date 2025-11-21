const models = require("../models");
const ExternalAPIService = require("./ExternalAPIService");

class PurchaseRequestService {
  static async createPurchaseRequest(reference, warehouseId, items) {
    const transaction = await models.sequelize.transaction();

    try {
      // Create purchase request
      const purchaseRequest = await models.PurchaseRequest.create(
        {
          reference,
          warehouse_id: warehouseId,
          status: "DRAFT",
        },
        { transaction }
      );

      // Create purchase request items
      const purchaseRequestItems = await Promise.all(
        items.map((item) =>
          models.PurchaseRequestItem.create(
            {
              purchase_request_id: purchaseRequest.id,
              product_id: item.product_id,
              quantity: item.quantity,
            },
            { transaction }
          )
        )
      );

      await transaction.commit();

      return {
        ...purchaseRequest.toJSON(),
        items: purchaseRequestItems.map((item) => item.toJSON()),
      };
    } catch (error) {
      await transaction.rollback();
      console.error("Error creating purchase request:", error);
      throw error;
    }
  }

  static async updatePurchaseRequest(requestId, data) {
    const transaction = await models.sequelize.transaction();

    try {
      const purchaseRequest = await models.PurchaseRequest.findByPk(requestId, {
        include: [
          {
            model: models.PurchaseRequestItem,
            as: "items",
          },
        ],
        transaction,
      });

      if (!purchaseRequest) {
        throw new Error("Purchase Request not found");
      }

      // Only allow updates if status is DRAFT
      if (purchaseRequest.status !== "DRAFT") {
        throw new Error(
          "Cannot update purchase request with status " + purchaseRequest.status
        );
      }

      // Update basic fields
      if (data.reference) {
        purchaseRequest.reference = data.reference;
      }

      if (data.warehouse_id) {
        purchaseRequest.warehouse_id = data.warehouse_id;
      }

      // Handle status change to PENDING
      if (data.status === "PENDING" && purchaseRequest.status === "DRAFT") {
        purchaseRequest.status = "PENDING";

        // Fetch items with product associations
        const itemsWithProducts = await models.PurchaseRequestItem.findAll({
          where: { purchase_request_id: requestId },
          include: [
            {
              model: models.Product,
              as: "product",
            },
          ],
          transaction,
        });

        // Prepare data for external API notification
        const notificationData = {
          reference: purchaseRequest.reference,
          warehouse_id: purchaseRequest.warehouse_id,
          status: "PENDING",
          items: itemsWithProducts.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
        };

        // Notify external service
        try {
          await ExternalAPIService.notifyHubFoomid(notificationData);
        } catch (apiError) {
          console.warn(
            "External API notification failed, but continuing:",
            apiError.message
          );
        }
      } else if (data.status && data.status !== purchaseRequest.status) {
        purchaseRequest.status = data.status;
      }

      // Handle items update
      if (data.items && Array.isArray(data.items)) {
        // Delete existing items
        await models.PurchaseRequestItem.destroy(
          {
            where: { purchase_request_id: requestId },
          },
          { transaction }
        );

        // Create new items
        await Promise.all(
          data.items.map((item) =>
            models.PurchaseRequestItem.create(
              {
                purchase_request_id: requestId,
                product_id: item.product_id,
                quantity: item.quantity,
              },
              { transaction }
            )
          )
        );
      }

      await purchaseRequest.save({ transaction });
      await transaction.commit();

      // Fetch updated record with items
      const updatedRequest = await models.PurchaseRequest.findByPk(requestId, {
        include: [
          {
            model: models.PurchaseRequestItem,
            as: "items",
          },
        ],
      });

      return updatedRequest.toJSON();
    } catch (error) {
      await transaction.rollback();
      console.error("Error updating purchase request:", error);
      throw error;
    }
  }

  static async deletePurchaseRequest(requestId) {
    const transaction = await models.sequelize.transaction();

    try {
      const purchaseRequest = await models.PurchaseRequest.findByPk(requestId, {
        transaction,
      });

      if (!purchaseRequest) {
        throw new Error("Purchase Request not found");
      }

      // Only allow deletion if status is DRAFT
      if (purchaseRequest.status !== "DRAFT") {
        throw new Error(
          "Cannot delete purchase request with status " +
            purchaseRequest.status +
            ". Only DRAFT requests can be deleted."
        );
      }

      await purchaseRequest.destroy({ transaction });
      await transaction.commit();

      return { message: "Purchase Request deleted successfully" };
    } catch (error) {
      await transaction.rollback();
      console.error("Error deleting purchase request:", error);
      throw error;
    }
  }

  static async getPurchaseRequestByReference(reference) {
    try {
      const purchaseRequest = await models.PurchaseRequest.findOne({
        where: { reference },
        include: [
          {
            model: models.PurchaseRequestItem,
            as: "items",
            include: [
              {
                model: models.Product,
                as: "product",
              },
            ],
          },
        ],
      });

      return purchaseRequest;
    } catch (error) {
      console.error("Error fetching purchase request by reference:", error);
      throw error;
    }
  }
}

module.exports = PurchaseRequestService;
