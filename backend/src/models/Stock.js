const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Stock = sequelize.define(
    "Stock",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      warehouse_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "warehouses",
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
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
    },
    {
      timestamps: true,
      tableName: "stocks",
      indexes: [
        {
          unique: true,
          fields: ["warehouse_id", "product_id"],
        },
      ],
    }
  );

  Stock.associate = (models) => {
    Stock.belongsTo(models.Warehouse, {
      foreignKey: "warehouse_id",
      as: "warehouse",
    });
    Stock.belongsTo(models.Product, {
      foreignKey: "product_id",
      as: "product",
    });
  };

  return Stock;
};
