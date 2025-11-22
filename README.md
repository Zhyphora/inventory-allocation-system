# Inventory Allocation System

A full-stack web application for managing inventory allocation, stock levels, and purchase requests with real-time webhook integration.

## Project Structure

```
.
├── backend/          # Express.js REST API with PostgreSQL
├── frontend/         # Next.js 14 web application
└── README.md         # This file
```

## Quick Start

### Prerequisites

- Node.js 18+ (backend and frontend)
- MySQL 8+ (backend database)
- npm or yarn
- localtunnel (untuk expose local server ke internet)

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env dengan konfigurasi berikut:
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=foom_inventory
# DB_USER=root
# DB_PASSWORD=root
# PORT=3000
# NODE_ENV=development
# API_KEY=Testing1
# VENDOR_NAME=FOOMLAB
# HUB_FOOMID_URL=https://hub.foomid.id

# Run migrations
npx sequelize-cli db:migrate

# Seed initial data
npx sequelize-cli db:seed:all

# Start development server (Terminal 1)
npm run dev
# Backend berjalan di http://localhost:3000
# Output: "Server is running on port 3000"
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Default config (biasanya sudah benar):
# NEXT_PUBLIC_API_URL=http://localhost:3000
# NEXT_PUBLIC_API_KEY=Testing1

# Start development server (Terminal 2)
npm run dev
# Frontend berjalan di http://localhost:3001
# Output: "ready - started server on 0.0.0.0:3001"
```

### 3. Localtunnel Setup (untuk Webhook dari hub.foomid.id)

```bash
# Terminal 3 - Buka terminal baru
npx localtunnel --port 3000 --subdomain sad-rules-dress

# Output akan menampilkan:
# "your url is: https://sad-rules-dress.loca.lt"
# Ini adalah URL yang bisa diakses dari internet (dari hub.foomid.id)
```

### Verification Checklist

- [ ] Backend running: `curl -H "x-api-key: Testing1" http://localhost:3000/api/products`
  - Should return: `{"status": "success", "data": [...]}`
- [ ] Frontend accessible: Open http://localhost:3001 in browser
  - Should show: Inventory System dashboard dengan stats
- [ ] Tunnel active: `curl https://sad-rules-dress.loca.lt/api/products -H "x-api-key: Testing1"`
  - Should return: Same response as local backend

---

## Cara Menggunakan Sistem

### Dashboard (http://localhost:3001)

**Fitur Utama:**

1. **Quick Stats** (Top)

   - Total Products: Jumlah produk unik
   - Total Stock Units: Total quantity semua warehouse
   - Warehouses: Jumlah warehouse yang memiliki stock

2. **Track Purchase Request**

   - Klik "Click here to enter PR number →"
   - Input PR number (misal: PR00002)
   - System akan menampilkan:
     - Status PR (DRAFT/PENDING/COMPLETED)
     - Items yang di-order
     - Stock dari warehouse tersebut

3. **Filter Stock Inventory**

   - **Filter by SKU**: Ketik SKU produk (misal: ICYMINT)
   - **Filter by Warehouse**: Ketik nama warehouse (misal: Surabaya Warehouse)
   - Bisa combine kedua filter
   - Real-time filtering saat mengetik

4. **Stock Inventory Table**
   - Menampilkan semua stock dengan kolom:
     - Product: Nama produk
     - SKU: Stock Keeping Unit
     - Warehouse: Lokasi warehouse
     - Stock: Quantity (ditampilkan dalam badge hijau)

### Purchase Requests (http://localhost:3001/purchase-requests)

**Fitur:**

1. **Stats Cards** (Top)

   - Total: Semua PR
   - Draft: PR yang masih draft
   - Pending: PR menunggu stock diterima
   - Completed: PR sudah selesai

2. **Search & Filter**

   - Search by Reference: Cari PR by nomor
   - Status Filter: Filter by DRAFT/PENDING/COMPLETED/All

3. **Purchase Request Table**
   - Reference: Nomor PR
   - Warehouse: Lokasi warehouse
   - Items: Jumlah item (dalam badge)
   - Status: Status dengan warna (hijau=completed, kuning=pending, abu=draft)
   - Date: Tanggal pembuatan
   - Action: "View Details →" untuk melihat detail

### Create Purchase Request (http://localhost:3001/purchase-requests/create)

**Langkah-langkah:**

1. **Select Warehouse**

   - Pilih warehouse dari dropdown (misal: Surabaya Warehouse)

2. **Add Items**

   - Klik "Add Item" untuk menambah produk
   - Select Product: Pilih produk dari dropdown
   - Quantity: Input jumlah yang di-order
   - Remove: Tombol untuk hapus item

3. **Summary**

   - Menampilkan total items dan product count
   - Automatically calculated

4. **Submit**
   - Klik "Create" untuk membuat PR
   - Atau "Cancel" untuk batal

---

## Backend API Reference

### Authentication

Semua request harus include header:

```
x-api-key: Testing1
```

### Endpoints

#### Products

```bash
GET /api/products
# Response: Array of all products
```

#### Stocks

```bash
GET /api/stocks
# Get all stocks

GET /api/stocks?warehouse_id=UUID
# Filter by warehouse

GET /api/stocks?product_id=UUID
# Filter by product
```

#### Purchase Requests

```bash
GET /api/purchase/request
# Get all purchase requests

GET /api/purchase/request/reference/PR00002
# Get specific PR by reference

GET /api/purchase/request/{id}
# Get PR by ID

POST /api/purchase/request
# Create new PR
# Body: { warehouse_id, items: [{product_id, quantity}] }

PUT /api/purchase/request/{id}
# Update PR status
# Body: { status: "PENDING" or "COMPLETED" }

DELETE /api/purchase/request/{id}
# Delete PR (only if DRAFT)
```

#### Webhook

```bash
POST /api/webhook/receive-stock
# Receive stock from hub.foomid.id
# Body: {
#   "vendor": "FOOMLAB",
#   "reference": "PR00002",
#   "qty_total": 15,
#   "details": [{
#     "product_name": "Icy Mint",
#     "sku_barcode": "ICYMINT",
#     "qty": 15
#   }]
# }
```

---

## Tunneling dengan Localtunnel

### Setup

```bash
# Install globally (optional)
npm install -g localtunnel

# Atau jalankan langsung
npx localtunnel --port 3000 --subdomain sad-rules-dress
```

### What is Localtunnel?

Localtunnel expose local server (localhost:3000) ke internet dengan URL publik:

- Local: http://localhost:3000
- Internet: https://sad-rules-dress.loca.lt

Ini memungkinkan hub.foomid.id untuk mengirim webhook ke sistem local.

### Usage

**1. Start Backend**

```bash
cd backend && npm run dev
```

**2. Start Tunnel** (Terminal baru)

```bash
npx localtunnel --port 3000 --subdomain sad-rules-dress
# Output: "your url is: https://sad-rules-dress.loca.lt"
```

**3. Configure di hub.foomid.id**

- Webhook URL: `https://sad-rules-dress.loca.lt/api/webhook/receive-stock`
- Method: POST
- Content-Type: application/json

**4. Test Webhook**

```bash
# Local test
curl -X POST http://localhost:3000/api/webhook/receive-stock \
  -H "Content-Type: application/json" \
  -d '{
    "vendor": "FOOMLAB",
    "reference": "PR00002",
    "qty_total": 15,
    "details": [{"product_name": "Icy Mint", "sku_barcode": "ICYMINT", "qty": 15}]
  }'

# Via tunnel (simulates hub.foomid.id)
curl -X POST https://sad-rules-dress.loca.lt/api/webhook/receive-stock \
  -H "Content-Type: application/json" \
  -d '...'
```

### Troubleshooting Tunnel

**Tunnel tidak connect:**

```bash
# Check if port 3000 is accessible
curl http://localhost:3000/api/products -H "x-api-key: Testing1"

# Kill existing process jika perlu
lsof -ti:3000 | xargs kill -9
```

**SSL Certificate Error:**

```bash
# Use curl with -k flag
curl -k https://sad-rules-dress.loca.lt/api/products \
  -H "x-api-key: Testing1"
```

---

## Database Schema

### Tables

1. **warehouses**

   - id: UUID
   - name: String (Surabaya Warehouse, Jakarta Warehouse, dll)
   - created_at, updated_at: Timestamp

2. **products**

   - id: UUID
   - name: String
   - sku: String (ICYMINT, FRESHLEMON, dll)
   - created_at, updated_at: Timestamp

3. **stocks**

   - id: UUID
   - warehouse_id: FK to warehouses
   - product_id: FK to products
   - quantity: Integer
   - created_at, updated_at: Timestamp

4. **purchase_requests**

   - id: UUID
   - reference: String (PR00001, PR00002, dll) - UNIQUE
   - warehouse_id: FK to warehouses
   - status: Enum (DRAFT, PENDING, COMPLETED)
   - created_at, updated_at: Timestamp

5. **purchase_request_items**
   - id: UUID
   - purchase_request_id: FK to purchase_requests
   - product_id: FK to products
   - quantity: Integer
   - created_at, updated_at: Timestamp

---

## Quick Start Command (All in One)

```bash
# Terminal 1 - Backend
cd /Volumes/project-danu/foom/backend && npm run dev

# Terminal 2 - Frontend
cd /Volumes/project-danu/foom/frontend && npm run dev

# Terminal 3 - Tunnel
npx localtunnel --port 3000 --subdomain sad-rules-dress

# Then open browser
# http://localhost:3001 untuk akses frontend
```

## Design Decisions

### Architecture

1. **MVC Pattern**: Separation of concerns

   - Models: Database entities with relationships
   - Controllers: Request handling and validation
   - Services: Business logic implementation

2. **Response Standardization**: All endpoints return consistent response format

   ```json
   {
     "status": "success|error",
     "statusCode": 200,
     "message": "Human-readable message",
     "data": {},
     "error": null,
     "timestamp": "2024-01-01T00:00:00Z"
   }
   ```

3. **API Key Authentication**: Simple header-based security

   - Header: `x-api-key`
   - Value: `Testing1` (development)

4. **State Management (Frontend)**
   - Zustand for global error/loading state
   - React hooks for local component state
   - Axios interceptors for API calls

### Business Logic

1. **Purchase Request Status Flow**

   - DRAFT → PENDING (via PUT with status update)
   - PENDING → COMPLETED (via webhook stock receipt)
   - Can only delete DRAFT requests

2. **Stock Management**

   - Composite unique index on (warehouse_id, product_id)
   - Stock updated via webhook with ACID transaction
   - Idempotency check using idempotency headers

3. **Webhook Handling**
   - Vendor sends stock receipt to `/api/webhook/receive-stock`
   - System matches against purchase request reference
   - Updates stock and marks request as COMPLETED
   - Supports multiple items in single webhook

## Possible Improvements

### Backend

1. **Database**

   - Add indexes on frequently queried columns (status, created_at)
   - Implement database connection pooling optimization
   - Add archival tables for historical data

2. **API Features**

   - Pagination for list endpoints
   - Advanced filtering and sorting
   - Batch operations for multiple items
   - Request rate limiting and throttling

3. **Security**

   - JWT token authentication instead of API keys
   - Role-based access control (RBAC)
   - Audit logging for all state changes
   - Input sanitization and SQL injection prevention

4. **Operations**
   - Comprehensive logging with structured logs
   - Monitoring and alerting setup
   - Database backup automation
   - API usage analytics

### Frontend

1. **UX/UI**

   - Advanced data visualization (charts, graphs)
   - Export to CSV/PDF functionality
   - Bulk operations on purchase requests
   - Real-time notifications

2. **Performance**

   - Implement infinite scroll or pagination
   - Client-side data caching with SWR/React Query
   - Code splitting and lazy loading
   - Image optimization

3. **Testing**

   - Unit tests for components
   - Integration tests for API calls
   - E2E tests with Cypress/Playwright
   - Visual regression testing

4. **DevOps**
   - Docker containerization for both services
   - GitHub Actions CI/CD pipeline
   - Automated deployment to staging/production
   - Environment-specific builds

## Testing

### Using Postman Collection

1. Import `backend/Postman_Collection.json` into Postman
2. Set environment variables:
   - `base_url`: http://localhost:3000
   - `api_key`: Testing1
3. Run requests in order:
   - Health Check
   - Get Products
   - Get Stocks
   - Create Purchase Request (copy request ID)
   - Update Purchase Request to PENDING
   - Simulate Webhook (use reference from created PR)

### Manual API Testing

```bash
# Get all products
curl -H "x-api-key: Testing1" http://localhost:3000/api/products

# Get all stocks
curl -H "x-api-key: Testing1" http://localhost:3000/api/stocks

# Create purchase request
curl -X POST http://localhost:3000/api/purchase/request \
  -H "Content-Type: application/json" \
  -H "x-api-key: Testing1" \
  -d '{
    "warehouse_id": "UUID_HERE",
    "items": [{"product_id": "UUID_HERE", "quantity": 10}]
  }'
```

## Environment Variables

### Backend (.env)

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inventory_db
DB_USER=dev
DB_PASSWORD=Testing1
PORT=3000
NODE_ENV=development
API_KEY=Testing1
HUB_FOOMID_URL=https://hub.foomid.id
VENDOR_NAME=PT FOOM LAB GLOBAL
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_API_KEY=Testing1
```

## Documentation

- **API Documentation**: `backend/API_DOCUMENTATION.md`
- **OpenAPI Spec**: `backend/openapi.yaml`
- **Webhook Guide**: `backend/WEBHOOK.md`
- **Architecture**: `backend/MVC_ARCHITECTURE.md`
- **Postman Guide**: `backend/POSTMAN_GUIDE.md`

## Troubleshooting

### Backend Issues

**Port 3000 already in use**

```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Database connection failed**

- Verify PostgreSQL is running
- Check credentials in .env file
- Ensure database exists: `createdb inventory_db`
- Run migrations: `npx sequelize-cli db:migrate`

### Frontend Issues

**API calls failing with 401**

- Verify backend is running on http://localhost:3000
- Check `NEXT_PUBLIC_API_KEY` matches backend `API_KEY`
- Clear browser cache and local storage

**Build errors**

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Performance Considerations

- Stock dashboard filters data server-side
- Purchase requests list loads all records (add pagination for large datasets)
- API responses are optimized with selective field inclusion
- Frontend implements loading states to prevent duplicate requests
- Database indexes on frequently queried columns

## Security Notes

- API keys are currently hardcoded for development
- Use environment variables in production
- Implement JWT tokens for authentication
- Enable HTTPS in production
- Add rate limiting to prevent abuse
- Validate all user inputs server-side

## License

This project is provided as-is for evaluation purposes.

## Support

For issues or questions, please refer to the documentation files in the respective folders.
# inventory-allocation-system
# inventory-allocation-system
