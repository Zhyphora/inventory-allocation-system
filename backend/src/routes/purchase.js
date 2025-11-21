const express = require("express");
const PurchaseRequestController = require("../controllers/PurchaseRequestController");

const router = express.Router();

router.get("/request", PurchaseRequestController.getAllPurchaseRequests);

router.get("/request/:id", PurchaseRequestController.getPurchaseRequestById);

router.post("/request", PurchaseRequestController.createPurchaseRequest);

router.put("/request/:id", PurchaseRequestController.updatePurchaseRequest);

router.delete("/request/:id", PurchaseRequestController.deletePurchaseRequest);

module.exports = router;
