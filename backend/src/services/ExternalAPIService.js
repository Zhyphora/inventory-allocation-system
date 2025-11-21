const axios = require("axios");
require("dotenv").config();

class ExternalAPIService {
  static async notifyHubFoomid(purchaseRequestData) {
    try {
      const payload = {
        reference: purchaseRequestData.reference,
        warehouse_id: purchaseRequestData.warehouse_id,
        status: purchaseRequestData.status,
        items: purchaseRequestData.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        timestamp: new Date().toISOString(),
      };

      const response = await axios.post(
        `${process.env.HUB_FOOMID_URL}/notifications/purchase-request`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.API_KEY,
          },
          timeout: 10000,
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error notifying hub.foomid.id:", error.message);
      throw error;
    }
  }
}

module.exports = ExternalAPIService;
