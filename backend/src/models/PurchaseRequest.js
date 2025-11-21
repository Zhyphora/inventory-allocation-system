const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize) => {
  const PurchaseRequest = sequelize.define(
    "PurchaseRequest",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      reference: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      warehouse_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "warehouses",
          key: "id",
        },
      },
      status: {
        type: DataTypes.ENUM("DRAFT", "PENDING", "COMPLETED"),
        allowNull: false,
        defaultValue: "DRAFT",
      },
    },
    {
      timestamps: true,
      tableName: "purchase_requests",
    }
  );

  PurchaseRequest.associate = (models) => {
    PurchaseRequest.belongsTo(models.Warehouse, {
      foreignKey: "warehouse_id",
      as: "warehouse",
    });
    PurchaseRequest.hasMany(models.PurchaseRequestItem, {
      foreignKey: "purchase_request_id",
      as: "items",
    });
  };

  return PurchaseRequest;
};
