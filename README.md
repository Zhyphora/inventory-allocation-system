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
- PostgreSQL 12+ (backend)
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=inventory_db
# DB_USER=dev
# DB_PASSWORD=Testing1
# PORT=3000
# API_KEY=Testing1

# Run migrations
npx sequelize-cli db:migrate

# Seed initial data
npx sequelize-cli db:seed:all

# Start development server
npm run dev
# Server runs on http://localhost:3000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Default config:
# NEXT_PUBLIC_API_URL=http://localhost:3000
# NEXT_PUBLIC_API_KEY=Testing1

# Start development server
npm run dev
# Application runs on http://localhost:3000
```

## Features

### Backend (Express.js + PostgreSQL)

- **Stock Dashboard API**: GET `/api/stocks` - Retrieve inventory levels with optional filters
- **Product Management**: GET `/api/products` - List all products
- **Purchase Requests**: CRUD operations for purchase request lifecycle (DRAFT → PENDING → COMPLETED)
- **Webhook Integration**: POST `/api/webhook/receive-stock` - Handle stock receipt with idempotency
- **Authentication**: API Key authentication via `x-api-key` header
- **ACID Transactions**: Ensures data consistency in concurrent operations
- **Error Handling**: Standardized error responses with proper HTTP status codes

### Frontend (Next.js 14)

- **Stock Dashboard**: Real-time stock levels with warehouse/product filters
- **Purchase Requests List**: View all requests with search and filtering
- **Purchase Request Form**: Dynamic form with multiple items, warehouse/product selection
- **Purchase Request Detail**: View details, edit status, delete (if DRAFT)
- **Error Handling**: User-friendly error messages and loading states
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## API Endpoints

### Products

```
GET /api/products
```

### Stocks

```
GET /api/stocks
GET /api/stocks?warehouse_id={uuid}
GET /api/stocks?product_id={uuid}
GET /api/purchase/request
GET /api/purchase/request/{id}
```

### Purchase Requests

```
POST /api/purchase/request
PUT /api/purchase/request/{id}
DELETE /api/purchase/request/{id}
```

### Webhooks

```
POST /api/webhook/receive-stock
```

## Database Schema

### Tables

1. **warehouses** - Storage locations
2. **products** - Product catalog
3. **stocks** - Inventory levels (warehouse × product)
4. **purchase_requests** - Purchase orders (DRAFT/PENDING/COMPLETED)
5. **purchase_request_items** - Line items in purchase requests

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

## Version Control Strategy

- Feature branches: `feature/feature-name`
- Bug fixes: `bugfix/bug-name`
- Release branches: `release/v1.0.0`
- Commits: Clear, descriptive messages
- Pull requests: Include testing checklist and design decisions

## Contributing

1. Create a feature branch from `main`
2. Make changes following the existing code structure
3. Test thoroughly before submitting PR
4. Update documentation as needed
5. Follow the existing code style and conventions

## License

This project is provided as-is for evaluation purposes.

## Support

For issues or questions, please refer to the documentation files in the respective folders.
