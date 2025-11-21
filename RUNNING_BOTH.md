# 🚀 Running Both Backend & Frontend

## Port Configuration

| Service         | Port | URL                   |
| --------------- | ---- | --------------------- |
| **Backend API** | 3000 | http://localhost:3000 |
| **Frontend UI** | 3001 | http://localhost:3001 |

## Quick Start

### Terminal 1 - Start Backend

```bash
cd backend
npm run dev
# Backend running on http://localhost:3000
```

### Terminal 2 - Start Frontend

```bash
cd frontend
npm run dev
# Frontend running on http://localhost:3001
```

## Verify Both Running

```bash
lsof -i :3000 -i :3001
```

## Test Endpoints

**Backend API:**

```bash
curl http://localhost:3000/api/products \
  -H "x-api-key: Testing1"
```

**Frontend UI:**

```bash
open http://localhost:3001
# or just visit in browser
```

## Environment Variables

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_API_KEY=Testing1
```

### Backend (.env)

```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inventory_db
DB_USER=dev
DB_PASSWORD=Testing1
API_KEY=Testing1
```

## Features Available

✅ **Stock Dashboard** - View inventory by warehouse/product  
✅ **Purchase Requests** - List, create, edit, delete PRs  
✅ **Dynamic Forms** - Add multiple items per request  
✅ **Error Handling** - User-friendly error messages  
✅ **Real-time API** - Connected to backend API

## Workflow

1. **Open Frontend**: http://localhost:3001
2. **View Dashboard**: See all stock levels
3. **Create PR**: Add warehouse + products
4. **Manage PRs**: View, edit, or delete requests
5. **Backend API**: Access http://localhost:3000/api/...

## Troubleshooting

**Port 3000 already in use?**

```bash
lsof -i :3000
kill -9 <PID>
```

**Port 3001 already in use?**

```bash
lsof -i :3001
kill -9 <PID>
```

**Backend not responding?**

- Check DB connection: `psql -U dev -d inventory_db`
- Verify API key in headers
- Check .env file configuration

**Frontend not connecting?**

- Verify backend is running on 3000
- Check NEXT_PUBLIC_API_URL in .env.local
- Clear browser cache and reload

---

**Status**: ✅ Ready to Use!
