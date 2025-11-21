# MVC Architecture Documentation

## Project Structure

```
backend/
├── src/
│   ├── controllers/        # Business logic handlers
│   │   ├── ProductController.js
│   │   ├── StockController.js
│   │   ├── PurchaseRequestController.js
│   │   └── WebhookController.js
│   ├── models/            # Database models (Sequelize ORM)
│   │   ├── Warehouse.js
│   │   ├── Product.js
│   │   ├── Stock.js
│   │   ├── PurchaseRequest.js
│   │   ├── PurchaseRequestItem.js
│   │   └── index.js
│   ├── routes/            # API endpoints
│   │   ├── products.js
│   │   ├── stocks.js
│   │   ├── purchase.js
│   │   └── webhook.js
│   ├── services/          # Business logic services
│   │   ├── StockService.js
│   │   ├── PurchaseRequestService.js
│   │   └── ExternalAPIService.js
│   ├── middleware/        # Express middleware
│   │   ├── apiKeyMiddleware.js
│   │   └── errorHandler.js
│   ├── migrations/        # Database migrations
│   │   ├── 001-create-warehouse.js
│   │   ├── 002-create-product.js
│   │   ├── 003-create-stock.js
│   │   ├── 004-create-purchase-request.js
│   │   └── 005-create-purchase-request-item.js
│   ├── seeders/           # Initial data
│   │   └── 001-seed-initial-data.js
│   ├── config/            # Configuration
│   │   └── database.js
│   └── server.js          # Main application entry
├── config/
│   └── database.js        # Database configuration
├── .env                   # Environment variables
├── .env.example           # Example environment variables
├── .sequelizerc            # Sequelize CLI configuration
├── package.json           # Dependencies & scripts
└── README.md
```

## MVC Pattern Explanation

### Model (M)

Database models define the data structure and relationships:

**Files**: `src/models/*.js`

```javascript
// Example: Product Model
const Product = sequelize.define("Product", {
  id: { type: DataTypes.UUID, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  sku: { type: DataTypes.STRING, unique: true },
});
```

**Key Models**:

- `Warehouse`: Physical warehouse locations
- `Product`: Product catalog
- `Stock`: Inventory levels per warehouse/product
- `PurchaseRequest`: Purchase orders
- `PurchaseRequestItem`: Line items in purchase orders

### View (V)

API responses returned to clients (JSON format):

```javascript
// View example from ProductController
res.status(200).json({
  success: true,
  message: "Products retrieved successfully",
  data: products,
});
```

### Controller (C)

Handles HTTP requests and orchestrates data flow:

**Files**: `src/controllers/*.js`

```javascript
// Example: ProductController
class ProductController {
  static async getAllProducts(req, res, next) {
    try {
      const products = await models.Product.findAll({...});
      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      next(error);
    }
  }
}
```

## Data Flow Diagram

```
Request
   ↓
Route Handler (src/routes/*.js)
   ↓
Controller (src/controllers/*.js)
   ├→ Input Validation
   ├→ Call Service Layer
   └→ Format Response
   ↓
Service Layer (src/services/*.js)
   ├→ Business Logic
   ├→ Database Queries
   ├→ Transaction Management
   └→ External API Calls
   ↓
Model Layer (src/models/*.js)
   ├→ ORM Query Execution
   ├→ Database Constraints
   └→ Data Relationships
   ↓
Database (PostgreSQL)
   ↓
Response ← Controller ← Service ← Model
```

## Controller Responsibilities

### ProductController

Handles product-related requests:

```javascript
class ProductController {
  static async getAllProducts(req, res, next) {
    // Returns: { success, message, data: [products] }
  }
}
```

**Endpoint**: `GET /products`

### StockController

Handles inventory level queries:

```javascript
class StockController {
  static async getStockLevels(req, res, next) {
    // Accepts filters: warehouse_id, product_id
    // Returns: { success, message, data: [stocks] }
  }
}
```

**Endpoint**: `GET /stocks?warehouse_id=xxx&product_id=yyy`

### PurchaseRequestController

Manages purchase request lifecycle:

```javascript
class PurchaseRequestController {
  static async createPurchaseRequest(req, res, next)
  static async updatePurchaseRequest(req, res, next)
  static async deletePurchaseRequest(req, res, next)
}
```

**Endpoints**:

- `POST /purchase/request` - Create
- `PUT /purchase/request/{id}` - Update
- `DELETE /purchase/request/{id}` - Delete

### WebhookController

Processes incoming stock from vendors:

```javascript
class WebhookController {
  static async receiveStock(req, res, next)
    // Step 1: Validate vendor
    // Step 2: Lookup purchase request by reference
    // Step 3: Check idempotency (status !== COMPLETED)
    // Step 4: Map SKU to products
    // Step 5: Update stock in transaction
    // Step 6: Update status to COMPLETED
}
```

**Endpoint**: `POST /webhook/receive-stock`

## Service Layer

Services contain business logic that can be reused across controllers:

### StockService

```javascript
class StockService {
  static async getStockLevels(filters) {
    // Business logic to fetch stocks with relationships
  }

  static async updateStockQuantity(warehouseId, productId, quantity) {
    // Atomic stock update with transaction
    // Handles create if not exists
  }
}
```

### PurchaseRequestService

```javascript
class PurchaseRequestService {
  static async createPurchaseRequest(reference, warehouseId, items)
  static async updatePurchaseRequest(requestId, data)
  static async deletePurchaseRequest(requestId)
  static async getPurchaseRequestByReference(reference)
}
```

**Key Features**:

- Transaction management
- Status validation
- External API notification on PENDING transition
- Full CRUD operations

### ExternalAPIService

```javascript
class ExternalAPIService {
  static async notifyHubFoomid(purchaseRequestData)
    // POST to hub.foomid.id when status changes to PENDING
    // Includes retry logic and error handling
}
```

## Request Flow Example

### Create Purchase Request

```
1. POST /purchase/request
   {
     "warehouse_id": "uuid",
     "items": [
       { "product_id": "uuid", "quantity": 10 }
     ]
   }

2. Route: purchase.js
   router.post('/request', PurchaseRequestController.createPurchaseRequest)

3. Controller: PurchaseRequestController.createPurchaseRequest()
   - Validate warehouse exists
   - Validate all products exist
   - Generate reference (PR00001)
   - Call PurchaseRequestService

4. Service: PurchaseRequestService.createPurchaseRequest()
   - Start transaction
   - Create PurchaseRequest with status='DRAFT'
   - Create PurchaseRequestItem records
   - Commit transaction
   - Return created object

5. Model: Sequelize ORM
   - Execute SQL INSERT
   - Apply constraints
   - Return created records

6. Response: 201 Created
   {
     "success": true,
     "message": "Purchase Request created successfully",
     "data": {
       "id": "uuid",
       "reference": "PR00001",
       "status": "DRAFT",
       "items": [...]
     }
   }
```

## Request Flow Example

### Update Purchase Request to PENDING

```
1. PUT /purchase/request/{id}
   {
     "status": "PENDING"
   }

2. Route: purchase.js
   router.put('/request/:id', PurchaseRequestController.updatePurchaseRequest)

3. Controller: PurchaseRequestController.updatePurchaseRequest()
   - Verify request exists
   - Validate status transitions
   - Call PurchaseRequestService

4. Service: PurchaseRequestService.updatePurchaseRequest()
   - Verify current status is DRAFT
   - If status → PENDING:
     - Update status
     - Call ExternalAPIService.notifyHubFoomid()
   - Commit transaction
   - Return updated object

5. External API: ExternalAPIService.notifyHubFoomid()
   - POST to hub.foomid.id
   - Include reference, warehouse, items
   - Handle errors gracefully

6. Response: 200 OK
   {
     "success": true,
     "message": "Purchase Request updated successfully",
     "data": { ... }
   }
```

## Request Flow Example

### Receive Stock via Webhook

```
1. POST /webhook/receive-stock
   {
     "vendor": "PT FOOM LAB GLOBAL",
     "reference": "PR00001",
     "qty_total": 20,
     "details": [
       { "sku_barcode": "ICYMINT", "qty": 10 }
     ]
   }

2. Middleware: apiKeyMiddleware
   - Verify x-api-key header
   - Return 401/403 if invalid

3. Route: webhook.js
   router.post('/receive-stock', WebhookController.receiveStock)

4. Controller: WebhookController.receiveStock()
   - Validate payload fields
   - Verify vendor is authorized
   - Call PurchaseRequestService to lookup by reference
   - Verify not already COMPLETED (idempotency)
   - For each detail:
     - Find product by SKU
     - Call StockService.updateStockQuantity()
   - Update PurchaseRequest status to COMPLETED
   - Return processed items

5. Service: StockService.updateStockQuantity()
   - Start transaction
   - Find or create Stock record
   - Increment quantity
   - Commit transaction
   - Return updated stock

6. Response: 200 OK
   {
     "success": true,
     "message": "Stock received successfully",
     "data": {
       "reference": "PR00001",
       "status": "COMPLETED",
       "items_processed": [...]
     }
   }
```

## Error Handling Flow

```
Request
   ↓
Route Handler (src/routes/*.js)
   ↓
Controller (src/controllers/*.js)
   ├→ Validation Error?
   │  └→ Return 400 JSON response
   │
   ├→ Resource Not Found?
   │  └→ Return 404 JSON response
   │
   └→ No Error?
      └→ Call Service
         ↓
Service (src/services/*.js)
   ├→ Transaction Error?
   │  └→ Rollback & throw
   │
   └→ Business Logic Error?
      └→ throw
      ↓
Controller catches error
   └→ next(error)
      ↓
Error Handler Middleware (errorHandler.js)
   ├→ Sequelize Validation Error?
   │  └→ Return 400 with details
   │
   ├→ Unique Constraint Error?
   │  └→ Return 409 Conflict
   │
   ├→ Foreign Key Error?
   │  └→ Return 400
   │
   └→ Generic Error?
      └→ Return 500 Internal Server Error
```

## Transaction Management

### Stock Update with ACID Guarantee

```javascript
static async updateStockQuantity(warehouseId, productId, qty) {
  const transaction = await models.sequelize.transaction();

  try {
    const [stock, created] = await models.Stock.findOrCreate({
      where: { warehouse_id, product_id },
      defaults: { quantity: qty },
      transaction
    });

    if (!created) {
      stock.quantity += qty;
      await stock.save({ transaction });
    }

    await transaction.commit();
    return stock;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

**ACID Properties**:

- **Atomicity**: All or nothing - either entire update succeeds or rolls back
- **Consistency**: Stock quantity remains valid (non-negative)
- **Isolation**: Other transactions don't see partial updates
- **Durability**: Committed data persists

## API Response Format

All responses follow consistent format:

### Success Response

```json
{
  "success": true,
  "message": "Descriptive message",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

## Testing Each Layer

### Model Testing

```javascript
// Test: Product Model
const product = await Product.create({
  name: "Test Product",
  sku: "TEST",
});
expect(product.id).toBeDefined();
```

### Service Testing

```javascript
// Test: StockService
const stock = await StockService.updateStockQuantity(
  warehouseId,
  productId,
  10
);
expect(stock.quantity).toBe(initialQty + 10);
```

### Controller Testing

```javascript
// Test: ProductController
await ProductController.getAllProducts(req, res, next);
expect(res.status).toHaveBeenCalledWith(200);
expect(res.json).toHaveBeenCalledWith(
  expect.objectContaining({ success: true })
);
```

## Best Practices

1. **Controllers**: Keep thin - only handle HTTP concerns
2. **Services**: Contains all business logic - reusable and testable
3. **Models**: Pure data definitions - no business logic
4. **Error Handling**: Always use try-catch in async functions
5. **Transactions**: Use for operations affecting multiple tables
6. **Validation**: Validate in controllers before calling services
7. **Logging**: Log important operations in services
8. **Dependencies**: Inject dependencies rather than hardcoding

## Performance Optimization

### Query Optimization

```javascript
// Bad: N+1 query problem
const stocks = await Stock.findAll();
for (const stock of stocks) {
  stock.warehouse = await Warehouse.findByPk(stock.warehouse_id);
}

// Good: Use eager loading
const stocks = await Stock.findAll({
  include: [{ model: Warehouse, as: "warehouse" }],
});
```

### Indexing

```javascript
// Database migrations create indexes
await queryInterface.addIndex("stocks", ["warehouse_id", "product_id"], {
  unique: true,
});
```

### Pagination (Future Enhancement)

```javascript
// Recommended for list endpoints
router.get("/", async (req, res) => {
  const { limit = 10, offset = 0 } = req.query;
  const stocks = await StockService.getStockLevels({
    limit,
    offset,
  });
  res.json({ data: stocks, total: stocks.length });
});
```
