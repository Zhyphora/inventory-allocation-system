# Inventory Allocation System - Complete Setup & Documentation

## 🎯 Project Overview

**Inventory Allocation System** adalah REST API backend untuk manajemen inventory yang kompleks dengan:

- ✅ ACID Transaction Guarantee
- ✅ Idempotent Webhook Processing
- ✅ Vendor Integration (PT FOOM LAB GLOBAL)
- ✅ Stock Allocation Logic
- ✅ Purchase Request Lifecycle Management

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/          # Business logic handlers (MVC)
│   ├── models/              # Database models (Sequelize ORM)
│   ├── routes/              # API endpoints
│   ├── services/            # Business logic services
│   ├── middleware/          # Express middleware
│   ├── migrations/          # Database migrations
│   ├── seeders/             # Initial data
│   ├── config/              # Configuration
│   ├── utils/               # Utility helpers
│   └── server.js            # Main entry point
├── config/
│   └── database.js          # Database config
├── .env                     # Environment variables
├── .env.example             # Example env
├── .sequelizerc              # Sequelize config
├── .nodemonrc               # Nodemon config
├── package.json             # Dependencies
└── README.md

# Documentation Files
├── API_DOCUMENTATION.md        # Complete API reference
├── MVC_ARCHITECTURE.md         # Architecture & MVC pattern
├── WEBHOOK.md                  # Webhook documentation
├── DOCUMENTATION_TOOLS.md      # Tools guide (Postman, Swagger)
├── openapi.yaml                # OpenAPI/Swagger spec
└── Postman_Collection.json     # Postman collection
```

---

## 🚀 Quick Start

### 1. Setup Environment

```bash
cd backend

# Copy example env
cp .env.example .env

# Install dependencies
npm install
```

### 2. Database Setup

```bash
# Run migrations
npm run migrate

# Seed initial data
npm run seed
```

### 3. Start Server

```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

Server akan berjalan di: **http://localhost:3000**

---

## 📚 Documentation Guide

### Quick Reference

| Dokumentasi                | Use Case                     | Link                   |
| -------------------------- | ---------------------------- | ---------------------- |
| **API_DOCUMENTATION.md**   | Testing & Implementation     | Start here 👈          |
| **MVC_ARCHITECTURE.md**    | Understanding code structure | Design reference       |
| **WEBHOOK.md**             | Webhook integration details  | Vendor integration     |
| **DOCUMENTATION_TOOLS.md** | Tools setup guide            | Postman, Swagger UI    |
| **openapi.yaml**           | OpenAPI spec                 | Auto-generation, tools |

### 📖 How to Use Documentation

**Untuk Developer:**

1. Baca `API_DOCUMENTATION.md` untuk understand API
2. Refer `MVC_ARCHITECTURE.md` untuk understand code
3. Setup Postman atau Swagger untuk testing

**Untuk Product Owner:**

1. Check `API_DOCUMENTATION.md` endpoint list
2. Review error handling
3. Understand business logic in `WEBHOOK.md`

**Untuk DevOps/Deployment:**

1. Check `.env` requirements
2. Review migrations setup
3. Check `DOCUMENTATION_TOOLS.md` untuk monitoring setup

---

## 🔌 API Endpoints

### Products

```
GET /products                    # Get all products
```

### Stocks

```
GET /stocks                      # Get stock levels (with filters)
```

### Purchase Requests

```
POST /purchase/request           # Create purchase request (DRAFT)
PUT /purchase/request/{id}       # Update purchase request
DELETE /purchase/request/{id}    # Delete purchase request
```

### Webhooks

```
POST /webhook/receive-stock      # Receive stock from supplier
```

---

## 📊 Response Format

### Success Response ✅

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Descriptive message",
  "data": {
    /* response data */
  },
  "error": null,
  "timestamp": "2025-11-21T10:00:00.000Z"
}
```

### Error Response ❌

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Error description",
  "data": null,
  "error": {
    "type": "ERROR_TYPE",
    "details": "Additional details"
  },
  "timestamp": "2025-11-21T10:00:00.000Z"
}
```

---

## 🗄️ Database Models

### Warehouse

```javascript
{
  id: UUID (PK),
  name: String
}
```

### Product

```javascript
{
  id: UUID (PK),
  name: String,
  sku: String (UNIQUE)
}
```

### Stock

```javascript
{
  id: UUID (PK),
  warehouse_id: UUID (FK),
  product_id: UUID (FK),
  quantity: Integer
  // Unique index: (warehouse_id, product_id)
}
```

### PurchaseRequest

```javascript
{
  id: UUID (PK),
  reference: String (UNIQUE),
  warehouse_id: UUID (FK),
  status: ENUM('DRAFT', 'PENDING', 'COMPLETED')
}
```

### PurchaseRequestItem

```javascript
{
  id: UUID (PK),
  purchase_request_id: UUID (FK),
  product_id: UUID (FK),
  quantity: Integer
}
```

---

## 🔐 Authentication

**Method**: API Key

**Header**:

```
x-api-key: your-secret-api-key-here
```

**Setup in `.env`**:

```env
API_KEY=your-secret-api-key-here
```

---

## 🌐 Workflow Example

### 1️⃣ Planning Phase (Status: DRAFT)

```bash
POST /purchase/request
{
  "warehouse_id": "uuid",
  "items": [
    { "product_id": "uuid", "quantity": 10 }
  ]
}
# Response: reference = "PR000123456", status = "DRAFT"
```

### 2️⃣ Notification Phase (Status: PENDING)

```bash
PUT /purchase/request/{id}
{ "status": "PENDING" }
# Triggers notification to hub.foomid.id
```

### 3️⃣ Execution Phase (Status: COMPLETED)

```bash
POST /webhook/receive-stock
{
  "vendor": "PT FOOM LAB GLOBAL",
  "reference": "PR000123456",
  "qty_total": 20,
  "details": [
    { "sku_barcode": "ICYMINT", "qty": 10 }
  ]
}
# Status automatically changed to COMPLETED
# Stock updated in transaction
```

### 4️⃣ Verification

```bash
GET /stocks
# Returns updated inventory levels
```

---

## 🛡️ Key Features

### ACID Transaction Guarantee

```javascript
// Webhook processing wrapped in transaction
const transaction = await models.sequelize.transaction();
try {
  // All operations here
  await transaction.commit();
} catch (error) {
  await transaction.rollback(); // Automatic rollback
}
```

### Idempotency

```
Multiple webhook calls with same reference:
- First call: ✅ Process & status → COMPLETED
- Second call: ❌ 409 Conflict (already processed)
- Safe for retry logic
```

### Business Logic Validation

```
POST /purchase/request:
- Verify warehouse exists
- Verify all products exist
- Generate unique reference

PUT /purchase/request:
- Only update if status = DRAFT
- Notify external service if → PENDING

DELETE /purchase/request:
- Only delete if status = DRAFT

POST /webhook/receive-stock:
- Verify vendor is authorized
- Lookup purchase request by reference
- Check status not already COMPLETED
- Map SKU to products
- Update stock in transaction
```

---

## 🧪 Testing Checklist

### Manual Testing with cURL

```bash
# 1. Get products
curl -X GET http://localhost:3000/products \
  -H 'x-api-key: your-secret-api-key-here'

# 2. Get stock levels
curl -X GET http://localhost:3000/stocks \
  -H 'x-api-key: your-secret-api-key-here'

# 3. Create purchase request
curl -X POST http://localhost:3000/purchase/request \
  -H 'x-api-key: your-secret-api-key-here' \
  -H 'Content-Type: application/json' \
  -d '{ "warehouse_id": "...", "items": [...] }'

# 4. Update to PENDING
curl -X PUT http://localhost:3000/purchase/request/{id} \
  -H 'x-api-key: your-secret-api-key-here' \
  -H 'Content-Type: application/json' \
  -d '{ "status": "PENDING" }'

# 5. Webhook - Receive stock
curl -X POST http://localhost:3000/webhook/receive-stock \
  -H 'x-api-key: your-secret-api-key-here' \
  -H 'Content-Type: application/json' \
  -d '{
    "vendor": "PT FOOM LAB GLOBAL",
    "reference": "PR...",
    "details": [...]
  }'

# 6. Verify with Postman/Swagger
# See DOCUMENTATION_TOOLS.md for setup
```

---

## 🔧 Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inventory_db
DB_USER=postgres
DB_PASSWORD=postgres

# Server
PORT=3000
NODE_ENV=development

# Security
API_KEY=your-secret-api-key-here

# External Services
HUB_FOOMID_URL=https://hub.foomid.id
VENDOR_NAME=PT FOOM LAB GLOBAL
```

---

## 📦 Dependencies

### Production

- **express** - Web framework
- **sequelize** - ORM
- **pg** - PostgreSQL driver
- **dotenv** - Environment variables
- **uuid** - UUID generation
- **axios** - HTTP client

### Development

- **nodemon** - Auto-reload

### Migration

- **sequelize-cli** - Database migrations

---

## 🚨 Error Handling

| Status | Error Type            | Meaning                         |
| ------ | --------------------- | ------------------------------- |
| 400    | VALIDATION_ERROR      | Input validation failed         |
| 401    | UNAUTHORIZED          | Missing API key                 |
| 403    | FORBIDDEN             | Invalid vendor                  |
| 404    | NOT_FOUND             | Resource not found              |
| 409    | CONFLICT              | Idempotency (already processed) |
| 500    | INTERNAL_SERVER_ERROR | Server error                    |

---

## 📋 API Commands Quick Reference

### Get All Products

```bash
GET /products
```

### Get Stock with Filter

```bash
GET /stocks?warehouse_id=<uuid>&product_id=<uuid>
```

### Create Purchase Request

```bash
POST /purchase/request
Body: { warehouse_id, items: [{product_id, quantity}] }
```

### Update Purchase Request

```bash
PUT /purchase/request/{id}
Body: { status: "PENDING" } | { warehouse_id, items }
```

### Delete Purchase Request

```bash
DELETE /purchase/request/{id}
```

### Webhook - Receive Stock

```bash
POST /webhook/receive-stock
Body: { vendor, reference, qty_total, details: [{product_name, sku_barcode, qty}] }
```

---

## 🔄 Development Workflow

```bash
# 1. Start server with auto-reload
npm run dev

# 2. In another terminal, test API
curl http://localhost:3000/products \
  -H 'x-api-key: your-secret-api-key-here'

# 3. View logs in first terminal
# Make changes to code
# Server auto-reloads with nodemon

# 4. When ready to commit
git add .
git commit -m "feature: add inventory functionality"
```

---

## 🎓 Learning Path

1. **Day 1**: Read `API_DOCUMENTATION.md` → Understand endpoints
2. **Day 2**: Test with cURL → Try all endpoints
3. **Day 3**: Setup Postman → Create test collection
4. **Day 4**: Read `MVC_ARCHITECTURE.md` → Understand code structure
5. **Day 5**: Read `WEBHOOK.md` → Understand integration logic
6. **Day 6**: Setup Swagger UI → Generate API documentation
7. **Day 7**: Deploy & monitor

---

## 🚀 Deployment Checklist

- [ ] Review `.env` production values
- [ ] Set secure API_KEY
- [ ] Run migrations: `npm run migrate`
- [ ] Seed production data
- [ ] Setup PostgreSQL database
- [ ] Configure external services (hub.foomid.id)
- [ ] Setup monitoring/logging
- [ ] Enable CORS if needed
- [ ] Setup SSL/TLS
- [ ] Test all endpoints
- [ ] Document deployment steps
- [ ] Setup backup strategy

---

## 📞 Support

**Need Help?**

1. Check relevant documentation file
2. Review error message details
3. Check server logs
4. Refer to code comments

**Documentation Files:**

- `API_DOCUMENTATION.md` - API reference
- `MVC_ARCHITECTURE.md` - Code structure
- `WEBHOOK.md` - Webhook details
- `DOCUMENTATION_TOOLS.md` - Tools setup

---

## 📝 License

MIT License - Feel free to use and modify

---

## ✨ Summary

Anda sekarang memiliki:
✅ Complete REST API dengan ACID guarantee
✅ MVC architecture terstruktur
✅ Comprehensive documentation (3 format)
✅ Ready for production deployment
✅ Easy to test dan debug
✅ Scalable architecture
✅ Professional response format
✅ Full webhook integration

**Untuk mulai**:

1. Baca `API_DOCUMENTATION.md`
2. Setup environment
3. Run server: `npm run dev`
4. Test endpoints dengan cURL atau Postman
5. Deploy dengan confidence! 🚀

---

**Last Updated**: November 21, 2025
**Version**: 1.0.0
