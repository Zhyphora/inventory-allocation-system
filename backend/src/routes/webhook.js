const express = require("express");
const WebhookController = require("../controllers/WebhookController");

const router = express.Router();

router.post("/receive-stock", WebhookController.receiveStock);

module.exports = router;
