# Webhook Documentation

## Overview

The Inventory Allocation System uses webhooks to handle incoming stock from suppliers. The webhook endpoint processes stock delivery updates and manages ACID compliance through transactions.

## Webhook Endpoint

**POST** `/webhook/receive-stock`

## Payload Format

Based on PT FOOM LAB GLOBAL webhook structure:

```json
{
  "vendor": "PT FOOM LAB GLOBAL",
  "reference": "PR00001",
  "qty_total": 20,
  "details": [
    {
      "product_name": "ICY MINT",
      "sku_barcode": "ICYMINT",
      "qty": 10
    },
    {
      "product_name": "ICY WATERMELON",
      "sku_barcode": "ICYWATERMELON",
      "qty": 10
    }
  ]
}
```

## Required Fields

| Field       | Type   | Description                                  |
| ----------- | ------ | -------------------------------------------- |
| `vendor`    | String | Vendor name (must be "PT FOOM LAB GLOBAL")   |
| `reference` | String | Purchase Request reference (e.g., "PR00001") |
| `qty_total` | Number | Total quantity in shipment                   |
| `details`   | Array  | Array of product details                     |

## Detail Object Fields

| Field          | Type   | Description                                 |
| -------------- | ------ | ------------------------------------------- |
| `product_name` | String | Product name                                |
| `sku_barcode`  | String | Product SKU/Barcode (must match system SKU) |
| `qty`          | Number | Quantity of this product                    |

## Processing Logic

### Step 1: Warehouse Lookup

- Extract `reference` from webhook payload
- Query `PurchaseRequest` table by reference
- Retrieve `warehouse_id` from matched record
- **Error**: If reference doesn't exist → 404 response

### Step 2: SKU Mapping & Parsing

- Iterate through `details` array
- Map `sku_barcode` to internal Product SKU
- Verify product exists in system
- **Error**: If SKU doesn't exist → 404 response

### Step 3: Idempotency

- Check PurchaseRequest status
- If status is `COMPLETED` → 409 Conflict (already processed)
- If status is `PENDING` → process stock and update to `COMPLETED`
- **Guarantees**: Stock is never added twice for the same reference

### Step 4: Stock Update (ACID Transaction)

- Begin database transaction
- For each product detail:
  - Find or create Stock record
  - Increment quantity by `qty`
  - Save Stock record
- Update PurchaseRequest status to `COMPLETED`
- Commit transaction
- **On Error**: Rollback entire transaction

## Response Format

### Success (200 OK)

```json
{
  "success": true,
  "message": "Stock received successfully",
  "data": {
    "reference": "PR00001",
    "warehouse_id": "uuid-here",
    "status": "COMPLETED",
    "items_processed": [
      {
        "product_id": "uuid",
        "product_name": "ICY MINT",
        "sku": "ICYMINT",
        "quantity_added": 10,
        "new_total": 50
      },
      {
        "product_id": "uuid",
        "product_name": "ICY WATERMELON",
        "sku": "ICYWATERMELON",
        "quantity_added": 10,
        "new_total": 45
      }
    ],
    "total_quantity": 20
  }
}
```

### Error Responses

#### 400 Bad Request - Missing Fields

```json
{
  "success": false,
  "error": "Missing required fields: vendor, reference, details"
}
```

#### 403 Forbidden - Invalid Vendor

```json
{
  "success": false,
  "error": "Vendor PT INVALID is not authorized"
}
```

#### 404 Not Found - Reference Not Found

```json
{
  "success": false,
  "error": "Purchase Request with reference PR00001 not found"
}
```

#### 404 Not Found - Product SKU Not Found

```json
{
  "success": false,
  "error": "Product with SKU INVALID_SKU not found in system"
}
```

#### 409 Conflict - Already Processed

```json
{
  "success": false,
  "error": "Stock for this Purchase Request has already been received",
  "message": "Webhook is idempotent - cannot process already completed requests"
}
```

## cURL Examples

### Test Webhook (Success)

```bash
curl -X POST 'http://localhost:3000/webhook/receive-stock' \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: your-secret-api-key-here' \
  -d '{
    "vendor": "PT FOOM LAB GLOBAL",
    "reference": "PR00001",
    "qty_total": 20,
    "details": [
      {
        "product_name": "ICY MINT",
        "sku_barcode": "ICYMINT",
        "qty": 10
      },
      {
        "product_name": "ICY WATERMELON",
        "sku_barcode": "ICYWATERMELON",
        "qty": 10
      }
    ]
  }'
```

### Test with Invalid Reference

```bash
curl -X POST 'http://localhost:3000/webhook/receive-stock' \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: your-secret-api-key-here' \
  -d '{
    "vendor": "PT FOOM LAB GLOBAL",
    "reference": "INVALID_REF",
    "qty_total": 20,
    "details": [
      {
        "product_name": "ICY MINT",
        "sku_barcode": "ICYMINT",
        "qty": 10
      }
    ]
  }'
```

### Test Idempotency (Already Completed)

```bash
curl -X POST 'http://localhost:3000/webhook/receive-stock' \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: your-secret-api-key-here' \
  -d '{
    "vendor": "PT FOOM LAB GLOBAL",
    "reference": "PR00001",
    "qty_total": 20,
    "details": [
      {
        "product_name": "ICY MINT",
        "sku_barcode": "ICYMINT",
        "qty": 5
      }
    ]
  }'
```

## Implementation Details

### Concurrency & ACID Compliance

1. **Atomicity**: Each webhook processing is wrapped in a database transaction
2. **Consistency**: All or nothing approach - if any error occurs, entire transaction rolls back
3. **Isolation**: Database transactions ensure no dirty reads
4. **Durability**: Committed transactions are permanent

### Idempotency Implementation

```javascript
// Check if already completed
if (purchaseRequest.status === "COMPLETED") {
  return res.status(409).json({
    success: false,
    error: "Stock for this Purchase Request has already been received",
  });
}

// Only process if PENDING
if (purchaseRequest.status === "PENDING") {
  purchaseRequest.status = "COMPLETED";
  await purchaseRequest.save({ transaction });
}
```

### Stock Update with Transaction

```javascript
const transaction = await models.sequelize.transaction();

try {
  for (const detail of details) {
    const product = await models.Product.findOne(
      { where: { sku: detail.sku_barcode } },
      { transaction }
    );

    const stock = await StockService.updateStockQuantity(
      purchaseRequest.warehouse_id,
      product.id,
      detail.qty
    );

    processedItems.push({ ...stock });
  }

  purchaseRequest.status = "COMPLETED";
  await purchaseRequest.save({ transaction });

  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

## Testing Workflow

1. **Create Purchase Request** → Status: `DRAFT`

   ```bash
   POST /purchase/request
   ```

2. **Update to PENDING** → Status: `PENDING`

   ```bash
   PUT /purchase/request/{id}
   ```

3. **Send Stock Webhook** → Status: `COMPLETED`

   ```bash
   POST /webhook/receive-stock
   ```

4. **Verify Stock Updated** → Check warehouse inventory

   ```bash
   GET /stocks
   ```

5. **Test Idempotency** → Try sending same webhook again
   ```bash
   POST /webhook/receive-stock (same payload)
   ```
   Expected: 409 Conflict response

## Error Handling Strategy

### Retry Logic (Client-Side)

For transient failures (500, 502, 503):

- Retry with exponential backoff
- Max 3 retries
- Wait 1s, 2s, 4s between attempts

For permanent failures (400, 403, 404, 409):

- Log and alert
- Do not retry automatically
- Manual intervention required

### Transaction Rollback Scenarios

The webhook automatically rolls back if any of these occur:

- Product SKU not found in system
- Database constraint violation
- Concurrent modification conflict
- Connection loss during processing

## Security

- All webhooks require valid `x-api-key` header
- Vendor name validation against `VENDOR_NAME` environment variable
- Input validation on all required fields
- SQL injection prevention through ORM (Sequelize)

## Monitoring

Log important webhook events:

```javascript
console.log({
  event: "webhook_received",
  vendor,
  reference,
  timestamp: new Date().toISOString(),
  status: "processing",
});

console.log({
  event: "webhook_completed",
  reference,
  items_processed: processedItems.length,
  timestamp: new Date().toISOString(),
});
```

## Integration with PT FOOM LAB GLOBAL

Expected webhook delivery:

- **Endpoint**: `https://your-server.com/webhook/receive-stock`
- **Method**: POST
- **Headers**: `Content-Type: application/json`, `x-api-key: <your-api-key>`
- **Retry Policy**: 3 retries with exponential backoff
- **Timeout**: 30 seconds

Configure in PT FOOM LAB GLOBAL admin panel:

1. Navigate to Webhook Settings
2. Set URL to your endpoint
3. Set API Key (shared securely)
4. Test delivery
5. Enable production mode
