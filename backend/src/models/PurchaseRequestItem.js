const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PurchaseRequestItem = sequelize.define(
    "PurchaseRequestItem",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      purchase_request_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "purchase_requests",
          key: "id",
        },
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "products",
          key: "id",
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
    },
    {
      timestamps: true,
      tableName: "purchase_request_items",
    }
  );

  PurchaseRequestItem.associate = (models) => {
    PurchaseRequestItem.belongsTo(models.PurchaseRequest, {
      foreignKey: "purchase_request_id",
      as: "purchaseRequest",
    });
    PurchaseRequestItem.belongsTo(models.Product, {
      foreignKey: "product_id",
      as: "product",
    });
  };

  return PurchaseRequestItem;
};
