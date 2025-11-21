const express = require("express");
const StockController = require("../controllers/StockController");

const router = express.Router();

router.get("/", StockController.getStockLevels);

module.exports = router;
