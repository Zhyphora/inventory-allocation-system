# Inventory Allocation System API

Professional REST API backend untuk sistem manajemen inventory dengan fitur kompleks, ACID transactions, dan webhook integration.

## 🚀 Quick Start

```bash
# Setup
cd backend
npm install
cp .env.example .env

# Run migrations & seed
npm run migrate
npm run seed

# Start server
npm run dev
```

Server berjalan di: **http://localhost:3000**

---

## 📚 Documentation

| Dokumentasi | Deskripsi |
|-------------|-----------|
| **API_DOCUMENTATION.md** | Reference lengkap semua endpoint dengan contoh |
| **MVC_ARCHITECTURE.md** | Struktur kode & pola MVC implementation |
| **WEBHOOK.md** | Webhook integration dari PT FOOM LAB GLOBAL |
| **DOCUMENTATION_TOOLS.md** | Setup Postman, Swagger UI, & tools lainnya |
| **openapi.yaml** | OpenAPI 3.0 specification (import ke Swagger/Postman) |
| **COMPLETE_GUIDE.md** | Dashboard komprehensif & learning path |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/products` | List semua produk |
| `GET` | `/stocks` | List inventory levels (dengan filter) |
| `POST` | `/purchase/request` | Buat purchase request (DRAFT) |
| `PUT` | `/purchase/request/{id}` | Update purchase request |
| `DELETE` | `/purchase/request/{id}` | Delete purchase request (DRAFT only) |
| `POST` | `/webhook/receive-stock` | Webhook - terima stok dari supplier |

---

## 🔐 Authentication

Semua endpoint memerlukan API Key:

```bash
curl -H "x-api-key: your-secret-key" http://localhost:3000/products
```

**Setup di `.env`:**
```env
API_KEY=your-secret-api-key-here
```

---

## 📊 Response Format

### Success ✅
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Products retrieved successfully",
  "data": [...],
  "error": null,
  "timestamp": "2025-11-21T10:00:00.000Z"
}
```

### Error ❌
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

## 🗄️ Database Models

- **Warehouse** - Lokasi fisik inventory
- **Product** - Katalog produk dengan SKU
- **Stock** - Inventory levels per warehouse-product
- **PurchaseRequest** - Purchase order dengan status tracking
- **PurchaseRequestItem** - Line items dalam purchase request

---

## 🌐 Workflow

```
1. DRAFT        → Buat purchase request
   ↓
2. PENDING      → Notifikasi ke supplier via webhook
   ↓
3. COMPLETED    → Terima stok & update inventory
```

---

## 🛡️ Key Features

✅ **ACID Transactions** - Garantian konsistensi data
✅ **Idempotency** - Webhook duplicate-safe
✅ **Status Tracking** - DRAFT → PENDING → COMPLETED
✅ **SKU Mapping** - Otomatis map barcode ke produk
✅ **API Key Auth** - Header-based authentication
✅ **Standardized Responses** - Konsisten across all endpoints

---

## 🧪 Testing

### Dengan cURL
```bash
GET /products
curl -X GET http://localhost:3000/products \
  -H 'x-api-key: your-secret-key'

CREATE /purchase/request
curl -X POST http://localhost:3000/purchase/request \
  -H 'x-api-key: your-secret-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "warehouse_id": "uuid",
    "items": [{"product_id": "uuid", "quantity": 10}]
  }'
```

### Dengan Postman/Swagger
- Import `openapi.yaml` ke Postman atau Swagger UI
- Lihat DOCUMENTATION_TOOLS.md untuk setup

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Express.js (Node.js) |
| **Database** | PostgreSQL |
| **ORM** | Sequelize |
| **Validation** | Custom middleware |
| **Auth** | API Key |

---

## 🔧 Environment Variables

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inventory_db
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3000
NODE_ENV=development
API_KEY=your-secret-api-key
HUB_FOOMID_URL=https://hub.foomid.id
VENDOR_NAME=PT FOOM LAB GLOBAL
```

---

## 📋 Development Commands

```bash
# Install dependencies
npm install

# Run migrations
npm run migrate

# Seed database
npm run seed

# Development (auto-reload with nodemon)
npm run dev

# Production
npm start
```

---

## 🚨 HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | OK - Success |
| 201 | Created - New resource |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Missing API key |
| 403 | Forbidden - Invalid vendor |
| 404 | Not Found - Resource missing |
| 409 | Conflict - Idempotency check (already processed) |
| 500 | Server Error |

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/          # Business logic handlers
│   ├── models/              # Database models
│   ├── routes/              # API endpoints
│   ├── services/            # Business services
│   ├── middleware/          # Express middleware
│   ├── migrations/          # Database migrations
│   ├── seeders/             # Initial data
│   ├── config/              # Configuration
│   ├── utils/               # Helpers
│   └── server.js            # Entry point
├── config/                  # Database config
├── .env                     # Environment variables
├── .sequelizerc              # Sequelize config
├── package.json             # Dependencies
└── README.md               # This file
```

---

## 🎯 Next Steps

1. **Review Documentation**
   - Baca API_DOCUMENTATION.md untuk semua endpoint details
   - Check MVC_ARCHITECTURE.md untuk code structure

2. **Setup Environment**
   - Configure `.env` dengan database credentials
   - Run migrations: `npm run migrate`

3. **Test API**
   - Use cURL atau import openapi.yaml ke Postman
   - Start dengan GET /products

4. **Integration**
   - Setup webhook endpoint untuk supplier
   - Configure external services di .env

5. **Deploy**
   - Prepare PostgreSQL production database
   - Set NODE_ENV=production
   - Secure API_KEY

---

## 🚀 Production Deployment

- [ ] Configure production database
- [ ] Set secure API_KEY
- [ ] Run migrations in production
- [ ] Configure SSL/TLS
- [ ] Setup logging & monitoring
- [ ] Configure external services
- [ ] Test all endpoints
- [ ] Setup backup strategy

---

## 📞 Support

**Resources:**
- API_DOCUMENTATION.md - Endpoint reference
- MVC_ARCHITECTURE.md - Code structure
- WEBHOOK.md - Webhook details
- DOCUMENTATION_TOOLS.md - Tools setup
- COMPLETE_GUIDE.md - Comprehensive guide

---

## 📄 License

MIT License

---

**Version:** 1.0.0  
**Last Updated:** November 21, 2025

**Documentation Files:**
- API_DOCUMENTATION.md (650 lines) - Complete endpoint reference
- MVC_ARCHITECTURE.md (579 lines) - Architecture & code structure
- WEBHOOK.md (393 lines) - Webhook integration guide
- DOCUMENTATION_TOOLS.md (438 lines) - Tools & setup guide
- openapi.yaml (531 lines) - OpenAPI specification
- COMPLETE_GUIDE.md (598 lines) - Comprehensive dashboard
- Postman_Collection.json - Import to Postman
