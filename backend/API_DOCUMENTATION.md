# API Documentation - Inventory Allocation System

## Base URL

```
http://localhost:3000
```

## Authentication

All endpoints require the `x-api-key` header:

```
x-api-key: your-secret-api-key-here
```

## Response Format

Semua response mengikuti format standar berikut:

### Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Descriptive message",
  "data": { ... },
  "error": null,
  "timestamp": "2025-11-21T10:00:00.000Z"
}
```

### Error Response

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Error message",
  "data": null,
  "error": {
    "type": "ERROR_TYPE",
    "details": "Additional error details"
  },
  "timestamp": "2025-11-21T10:00:00.000Z"
}
```

---

## Products API

### GET /products

**Deskripsi:** List semua available products

**Headers:**

```
x-api-key: your-secret-api-key-here
Content-Type: application/json
```

**Query Parameters:** None

**cURL Example:**

```bash
curl -X GET 'http://localhost:3000/products' \
  -H 'x-api-key: your-secret-api-key-here' \
  -H 'Content-Type: application/json'
```

**Response (200 OK):**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Icy Mint",
      "sku": "ICYMINT"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Fresh Lemon",
      "sku": "FRESHLEMON"
    }
  ],
  "error": null,
  "timestamp": "2025-11-21T10:00:00.000Z"
}
```

---

## Stocks API

### GET /stocks

**Deskripsi:** List stock levels untuk semua warehouse dengan optional filter

**Headers:**

```
x-api-key: your-secret-api-key-here
Content-Type: application/json
```

**Query Parameters:**
| Parameter | Type | Optional | Deskripsi |
|-----------|------|----------|-----------|
| warehouse_id | UUID | Yes | Filter by warehouse ID |
| product_id | UUID | Yes | Filter by product ID |

**cURL Example:**

```bash
curl -X GET 'http://localhost:3000/stocks' \
  -H 'x-api-key: your-secret-api-key-here' \
  -H 'Content-Type: application/json'
```

**With Filter:**

```bash
curl -X GET 'http://localhost:3000/stocks?warehouse_id=550e8400-e29b-41d4-a716-446655440010' \
  -H 'x-api-key: your-secret-api-key-here' \
  -H 'Content-Type: application/json'
```

**Response (200 OK):**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Stock levels retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "warehouse_id": "550e8400-e29b-41d4-a716-446655440010",
      "product_id": "550e8400-e29b-41d4-a716-446655440000",
      "quantity": 50,
      "warehouse": {
        "id": "550e8400-e29b-41d4-a716-446655440010",
        "name": "Jakarta Warehouse"
      },
      "product": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Icy Mint",
        "sku": "ICYMINT"
      }
    }
  ],
  "error": null,
  "timestamp": "2025-11-21T10:00:00.000Z"
}
```

---

## Purchase Requests API

### POST /purchase/request

**Deskripsi:** Create a new Purchase Request (Planning phase) dengan status DRAFT

**Headers:**

```
x-api-key: your-secret-api-key-here
Content-Type: application/json
```

**Request Body:**

```json
{
  "warehouse_id": "550e8400-e29b-41d4-a716-446655440010",
  "items": [
    {
      "product_id": "550e8400-e29b-41d4-a716-446655440000",
      "quantity": 10
    },
    {
      "product_id": "550e8400-e29b-41d4-a716-446655440001",
      "quantity": 5
    }
  ]
}
```

**cURL Example:**

```bash
curl -X POST 'http://localhost:3000/purchase/request' \
  -H 'x-api-key: your-secret-api-key-here' \
  -H 'Content-Type: application/json' \
  -d '{
    "warehouse_id": "550e8400-e29b-41d4-a716-446655440010",
    "items": [
      {
        "product_id": "550e8400-e29b-41d4-a716-446655440000",
        "quantity": 10
      }
    ]
  }'
```

**Response (201 Created):**

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Purchase Request created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "reference": "PR000123456",
    "warehouse_id": "550e8400-e29b-41d4-a716-446655440010",
    "status": "DRAFT",
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440021",
        "purchase_request_id": "550e8400-e29b-41d4-a716-446655440020",
        "product_id": "550e8400-e29b-41d4-a716-446655440000",
        "quantity": 10
      }
    ]
  },
  "error": null,
  "timestamp": "2025-11-21T10:00:00.000Z"
}
```

**Error Response (400 Validation Error):**

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "data": null,
  "error": {
    "type": "VALIDATION_ERROR",
    "details": "warehouse_id is required"
  },
  "timestamp": "2025-11-21T10:00:00.000Z"
}
```

---

### PUT /purchase/request/{id}

**Deskripsi:** Update Purchase Request (Planning phase) - Hanya allowed ketika status DRAFT

**Catatan Penting:**

- Jika status diubah menjadi PENDING, sistem akan trigger API request ke hub.foomid.id
- Data hanya dapat diubah ketika status masih DRAFT
- Setelah status berubah, tidak bisa update lagi

**Headers:**

```
x-api-key: your-secret-api-key-here
Content-Type: application/json
```

**Path Parameters:**
| Parameter | Type | Deskripsi |
|-----------|------|-----------|
| id | UUID | Purchase Request ID |

**Request Body (Update Status to PENDING):**

```json
{
  "status": "PENDING"
}
```

**Request Body (Update Items):**

```json
{
  "items": [
    {
      "product_id": "550e8400-e29b-41d4-a716-446655440000",
      "quantity": 20
    }
  ]
}
```

**cURL Example:**

```bash
curl -X PUT 'http://localhost:3000/purchase/request/550e8400-e29b-41d4-a716-446655440020' \
  -H 'x-api-key: your-secret-api-key-here' \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "PENDING"
  }'
```

**Response (200 OK):**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Purchase Request updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "reference": "PR000123456",
    "warehouse_id": "550e8400-e29b-41d4-a716-446655440010",
    "status": "PENDING"
  },
  "error": null,
  "timestamp": "2025-11-21T10:00:00.000Z"
}
```

**Error Response (400 Cannot Update):**

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Cannot update purchase request with status PENDING",
  "data": null,
  "error": {
    "type": "VALIDATION_ERROR",
    "details": "Only DRAFT requests can be updated"
  },
  "timestamp": "2025-11-21T10:00:00.000Z"
}
```

---

### DELETE /purchase/request/{id}

**Deskripsi:** Delete Purchase Request - Hanya allowed ketika status DRAFT

**Headers:**

```
x-api-key: your-secret-api-key-here
Content-Type: application/json
```

**Path Parameters:**
| Parameter | Type | Deskripsi |
|-----------|------|-----------|
| id | UUID | Purchase Request ID |

**cURL Example:**

```bash
curl -X DELETE 'http://localhost:3000/purchase/request/550e8400-e29b-41d4-a716-446655440020' \
  -H 'x-api-key: your-secret-api-key-here' \
  -H 'Content-Type: application/json'
```

**Response (200 OK):**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Purchase Request deleted successfully",
  "data": null,
  "error": null,
  "timestamp": "2025-11-21T10:00:00.000Z"
}
```

**Error Response (400 Cannot Delete):**

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Cannot delete purchase request with status PENDING. Only DRAFT requests can be deleted.",
  "data": null,
  "error": {
    "type": "VALIDATION_ERROR",
    "details": "Invalid status for deletion"
  },
  "timestamp": "2025-11-21T10:00:00.000Z"
}
```

---

## Webhook API

### POST /webhook/receive-stock

**Deskripsi:** Handle incoming stock dari supplier PT FOOM LAB GLOBAL (Execution phase)

**Logic Flow:**

1. **Step 1**: Validate vendor name harus "PT FOOM LAB GLOBAL"
2. **Step 2**: Lookup Purchase Request by reference
3. **Step 3**: Check idempotency - jika sudah COMPLETED, reject dengan 409
4. **Step 4**: Map SKU ke products
5. **Step 5**: Update stock dalam transaction (ACID guarantee)
6. **Step 6**: Update status menjadi COMPLETED

**Headers:**

```
x-api-key: your-secret-api-key-here
Content-Type: application/json
```

**Request Body:**

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

**cURL Example:**

```bash
curl -X POST 'http://localhost:3000/webhook/receive-stock' \
  -H 'x-api-key: your-secret-api-key-here' \
  -H 'Content-Type: application/json' \
  -d '{
    "vendor": "PT FOOM LAB GLOBAL",
    "reference": "PR00001",
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

**Response (200 OK):**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Stock received successfully",
  "data": {
    "reference": "PR00001",
    "warehouse_id": "550e8400-e29b-41d4-a716-446655440010",
    "status": "COMPLETED",
    "items_processed": [
      {
        "product_id": "550e8400-e29b-41d4-a716-446655440000",
        "product_name": "ICY MINT",
        "sku": "ICYMINT",
        "quantity_added": 10,
        "new_total": 60
      }
    ],
    "total_quantity": 20
  },
  "error": null,
  "timestamp": "2025-11-21T10:00:00.000Z"
}
```

**Error Response (404 Reference Not Found):**

```json
{
  "status": "error",
  "statusCode": 404,
  "message": "Purchase Request with reference PR00001 not found",
  "data": null,
  "error": {
    "type": "NOT_FOUND",
    "resource": "Purchase Request with reference PR00001"
  },
  "timestamp": "2025-11-21T10:00:00.000Z"
}
```

**Error Response (409 Conflict - Already Processed):**

```json
{
  "status": "error",
  "statusCode": 409,
  "message": "Stock for this Purchase Request has already been received",
  "data": {
    "reference": "PR00001",
    "status": "Already processed"
  },
  "error": {
    "type": "CONFLICT"
  },
  "timestamp": "2025-11-21T10:00:00.000Z"
}
```

**Error Response (403 Invalid Vendor):**

```json
{
  "status": "error",
  "statusCode": 403,
  "message": "Vendor PT INVALID is not authorized",
  "data": null,
  "error": {
    "type": "FORBIDDEN"
  },
  "timestamp": "2025-11-21T10:00:00.000Z"
}
```

---

## HTTP Status Codes

| Code | Meaning               | Digunakan untuk                                |
| ---- | --------------------- | ---------------------------------------------- |
| 200  | OK                    | Successful GET, PUT, DELETE requests           |
| 201  | Created               | Successful POST request (resource created)     |
| 400  | Bad Request           | Validation error, missing required fields      |
| 401  | Unauthorized          | Missing or invalid API key                     |
| 403  | Forbidden             | Valid API key but insufficient permissions     |
| 404  | Not Found             | Resource tidak ditemukan                       |
| 409  | Conflict              | Idempotency conflict (e.g., already processed) |
| 500  | Internal Server Error | Server error                                   |

---

## Error Types

| Error Type            | Description                              |
| --------------------- | ---------------------------------------- |
| VALIDATION_ERROR      | Input validation failed                  |
| NOT_FOUND             | Resource tidak ditemukan                 |
| UNAUTHORIZED          | Missing API key                          |
| FORBIDDEN             | Vendor atau user tidak authorized        |
| CONFLICT              | Idempotency atau business logic conflict |
| INTERNAL_SERVER_ERROR | Server error                             |

---

## Postman Collection

Untuk import di Postman, gunakan file: `Postman_Collection.json`

**Steps untuk import:**

1. Buka Postman
2. Click "Import" button
3. Pilih file `Postman_Collection.json`
4. Set variables: `base_url`, `api_key`, `purchase_request_id`
5. Start testing!

---

## Best Practices

1. **Always include x-api-key header** - semua requests harus authenticated
2. **Check response status field** - "success" atau "error"
3. **Handle error responses** - read `error.type` dan `error.details`
4. **Use UUIDs** - semua IDs menggunakan format UUID
5. **Idempotent operations** - webhook sudah idempotent, aman untuk retry
6. **Transaction safety** - stock updates dijamin ACID compliant
7. **Test in order** - CREATE → UPDATE → WEBHOOK → DELETE untuk full flow

---

## Testing Workflow

### 1. Create Product (optional - already seeded)

```bash
GET /products
```

### 2. Create Purchase Request

```bash
POST /purchase/request
```

Response akan berisi `reference` dan `id`

### 3. Update Status to PENDING

```bash
PUT /purchase/request/{id}
```

### 4. Receive Stock via Webhook

```bash
POST /webhook/receive-stock
```

Gunakan `reference` dari step 2

### 5. Verify Stock Updated

```bash
GET /stocks
```

### 6. Test Idempotency

```bash
POST /webhook/receive-stock
```

Kirim webhook yang sama, harusnya return 409 Conflict

### 7. Cleanup

```bash
DELETE /purchase/request/{id}
```

(Note: tidak bisa delete jika status bukan DRAFT)
