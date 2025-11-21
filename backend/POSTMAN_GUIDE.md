# Import Postman Collection - Panduan Lengkap

## 📱 Tentang Postman Collection

Postman Collection ini berisi semua endpoint API lengkap dengan:

- ✅ Pre-configured headers (x-api-key)
- ✅ Request body templates
- ✅ Query parameters
- ✅ Base URL configuration
- ✅ Environment variables

## 🚀 Cara Import ke Postman

### Metode 1: Import dari File

1. **Buka Postman**

   - Desktop app atau web: https://www.postman.com

2. **Click Import button**

   - Klik tombol "Import" di top-left corner

3. **Select file**

   - Pilih "File"
   - Browse ke: `/Volumes/project-danu/foom/backend/Postman_Collection.json`
   - Klik "Import"

4. **Koleksi sudah siap!**
   - Collection "Inventory Allocation System API" akan muncul di sidebar

### Metode 2: Import from URL (jika file hosted)

```
Paste URL ke Postman import dialog
```

---

## 📋 Struktur Collection

```
Inventory Allocation System API
├── Products
│   └── Get All Products
├── Stocks
│   ├── Get All Stocks
│   ├── Get Stocks by Warehouse
│   └── Get Stocks by Product
├── Purchase Requests
│   ├── Create Purchase Request
│   ├── Update Purchase Request
│   └── Delete Purchase Request
├── Webhooks
│   └── Receive Stock (PT FOOM LAB GLOBAL)
└── Health Check
```

---

## 🔧 Konfigurasi Environment

### Global Variables (sudah di-set):

- `base_url` = `http://localhost:3000`
- `api_key` = `Testing1`

### Cara menggunakan variable:

```
{{base_url}}/api/products
{{api_key}}
```

---

## 📝 Testing Workflow

### Step 1: Health Check

```
GET http://localhost:3000/health
```

- Tidak perlu API key
- Response: `{ "status": "ok", "timestamp": "..." }`

### Step 2: Get Products

```
GET {{base_url}}/api/products
Header: x-api-key: {{api_key}}
```

- Get list produk
- Copy `id` dari salah satu product

### Step 3: Create Purchase Request

```
POST {{base_url}}/api/purchase/request
Header: x-api-key: {{api_key}}
Body:
{
  "warehouse_id": "[WAREHOUSE_ID]",
  "items": [
    {
      "product_id": "[PRODUCT_ID]",
      "quantity": 10
    }
  ]
}
```

- Replace dengan UUID dari products & warehouses
- Response: `reference: "PR000123456"` - copy ini untuk webhook

### Step 4: Update Status to PENDING

```
PUT {{base_url}}/api/purchase/request/[REQUEST_ID]
Header: x-api-key: {{api_key}}
Body:
{
  "status": "PENDING"
}
```

- Triggers notification ke supplier

### Step 5: Receive Stock (Webhook)

```
POST {{base_url}}/api/webhook/receive-stock
Header: x-api-key: {{api_key}}
Body:
{
  "vendor": "PT FOOM LAB GLOBAL",
  "reference": "[COPY_DARI_STEP_3]",
  "qty_total": 20,
  "details": [
    {
      "product_name": "ICYMINT",
      "sku_barcode": "ICYMINT",
      "qty": 10
    }
  ]
}
```

- Status otomatis COMPLETED
- Stock terupdate

### Step 6: Verify Stocks Updated

```
GET {{base_url}}/api/stocks
Header: x-api-key: {{api_key}}
```

---

## 💡 Tips & Tricks

### Set Variable di Test Script

```javascript
var jsonData = pm.response.json();
pm.environment.set("warehouse_id", jsonData.data[0].id);
pm.environment.set("product_id", jsonData.data[0].product_id);
pm.environment.set("purchase_request_id", jsonData.data.id);
pm.environment.set("reference", jsonData.data.reference);
```

### Pre-request Script untuk Generate Data

```javascript
pm.environment.set("timestamp", Date.now());
pm.environment.set("random", Math.floor(Math.random() * 1000));
```

### Test Assertion untuk Validate Response

```javascript
pm.test("Status is success", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.status).to.eql("success");
});

pm.test("Status code is 200 or 201", function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

pm.test("Response time is less than 1000ms", function () {
  pm.expect(pm.response.responseTime).to.be.below(1000);
});
```

---

## 🔐 Security Notes

⚠️ **Important:**

- API_KEY di collection ini adalah `Testing1` untuk development
- JANGAN commit API key sensitif ke repository
- Gunakan Environment untuk manage different API keys:
  - Development: Testing1
  - Staging: [staging-key]
  - Production: [prod-key]

### Cara Setup Multiple Environments:

1. **Create Environments in Postman**

   - Click "Environments" tab
   - Create "Development", "Staging", "Production"

2. **Set variables per environment**

   ```
   Development:
   - api_key: Testing1
   - base_url: http://localhost:3000

   Production:
   - api_key: [prod-key]
   - base_url: https://api.example.com
   ```

3. **Switch environment saat testing**
   - Dropdown di top-right Postman

---

## 🐛 Troubleshooting

### Error: "x-api-key is required"

- Pastikan header `x-api-key: Testing1` included
- Check di request Headers tab

### Error: "Route not found"

- Pastikan URL benar: `/api/products` (bukan `/products`)
- Check trailing slashes

### Error: "Warehouse not found"

- Jalankan GET /products dulu
- Copy UUID yang sebenarnya, bukan placeholder

### Error: "EADDRINUSE: port 3000"

- Server sudah running
- Atau kill process: `lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9`

### Error: Database connection

- Pastikan PostgreSQL running
- Check .env credentials

---

## 📚 Additional Resources

**Documentation Files:**

- `API_DOCUMENTATION.md` - Endpoint reference dengan cURL examples
- `openapi.yaml` - OpenAPI spec (import ke Swagger UI)
- `MVC_ARCHITECTURE.md` - Code structure
- `WEBHOOK.md` - Webhook details
- `README.md` - Quick start guide

**External Tools:**

- **Swagger UI**: Import `openapi.yaml` ke https://editor.swagger.io
- **Insomnia**: Alternative ke Postman
- **cURL**: CLI testing

---

## 🎯 Quick Start dengan Postman

```bash
1. Import collection dari file
2. Make sure server running: npm run dev
3. Go to Products → Get All Products
4. Hit Send button
5. See response in Response tab
6. Follow workflow dari Step 2-6 di atas
```

---

## 📞 Support

Jika ada issue:

1. Check server logs: `npm run dev`
2. Verify database connected
3. Validate API key di .env
4. Read error response detail
5. Check documentation files

---

**Happy Testing! 🚀**

Version: 1.0.0
Last Updated: November 21, 2025
