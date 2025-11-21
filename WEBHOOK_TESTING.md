# Webhook Testing Guide

## Overview

Webhook endpoint untuk menerima stock receipt dari hub.foomid.id ke sistem inventory allocation.

**Endpoint**: `POST /api/webhook/receive-stock`
**Base URL**: https://sad-rules-dress.loca.lt (via localtunnel)

---

## Prerequisites

### 1. Backend Running

```bash
cd /Volumes/project-danu/foom/backend
npm run dev
```

Backend akan berjalan di `http://localhost:3000`

### 2. Localtunnel Running

```bash
# Terminal baru
npx localtunnel --port 3000 --subdomain sad-rules-dress
```

Atau jika sudah ada:

```bash
# Cek status
curl https://sad-rules-dress.loca.lt/health
```

### 3. Database dengan Purchase Request

Pastikan ada Purchase Request dengan status PENDING:

- PR00001 (ID: 043cd35e-5687-4345-9a0b-32ccc4da7e09)
- PR00002 (ID: 8b102730-4528-4062-b1c8-0811900312e6)

---

## Webhook Payload Format

### Standard Format (dari hub.foomid.id)

```json
{
  "vendor": "FOOMLAB",
  "reference": "PR00002",
  "qty_total": 15,
  "details": [
    {
      "product_name": "Icy Mint",
      "sku_barcode": "ICYMINT",
      "qty": 15
    }
  ]
}
```

### Important Notes

- **vendor**: HARUS "FOOMLAB" (sesuai dengan `VENDOR_NAME` di .env backend)
- **reference**: HARUS sama dengan Purchase Request reference (PR00001, PR00002, dll)
- **qty_total**: Total quantity semua items
- **details**: Array berisi item dengan product_name, sku_barcode, dan qty

---

## Testing Methods

### Method 1: Local Testing (curl)

**Test untuk PR00002**:

```bash
curl -X POST http://localhost:3000/api/webhook/receive-stock \
  -H "Content-Type: application/json" \
  -d '{
    "vendor": "FOOMLAB",
    "reference": "PR00002",
    "qty_total": 15,
    "details": [
      {
        "product_name": "Icy Mint",
        "sku_barcode": "ICYMINT",
        "qty": 15
      }
    ]
  }'
```

**Expected Response** (Success):

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Stock receipt processed successfully",
  "data": {
    "reference": "PR00002",
    "status": "COMPLETED",
    "items_processed": 1,
    "stock_updated": [
      {
        "product_sku": "ICYMINT",
        "warehouse": "Surabaya Warehouse",
        "quantity_added": 15,
        "new_total": 15
      }
    ]
  },
  "error": null,
  "timestamp": "2025-11-21T15:25:00.000Z"
}
```

### Method 2: Via Localtunnel (hub.foomid.id)

**1. Pastikan localtunnel aktif**:

```bash
npx localtunnel --port 3000 --subdomain sad-rules-dress
```

**2. Test dari terminal lain**:

```bash
curl -X POST https://sad-rules-dress.loca.lt/api/webhook/receive-stock \
  -H "Content-Type: application/json" \
  -d '{
    "vendor": "FOOMLAB",
    "reference": "PR00002",
    "qty_total": 15,
    "details": [
      {
        "product_name": "Icy Mint",
        "sku_barcode": "ICYMINT",
        "qty": 15
      }
    ]
  }'
```

### Method 3: Postman

**1. Create new POST request**

- URL: `http://localhost:3000/api/webhook/receive-stock` (untuk local)
- Atau: `https://sad-rules-dress.loca.lt/api/webhook/receive-stock` (untuk tunnel)

**2. Set Headers**:

- Key: `Content-Type`
- Value: `application/json`

**3. Set Body (raw JSON)**:

```json
{
  "vendor": "FOOMLAB",
  "reference": "PR00002",
  "qty_total": 15,
  "details": [
    {
      "product_name": "Icy Mint",
      "sku_barcode": "ICYMINT",
      "qty": 15
    }
  ]
}
```

**4. Click Send**

### Method 4: Via Frontend Dashboard

**1. Buka Dashboard** (http://localhost:3001)

**2. Di bagian "Track Purchase Request"**:

- Input: `PR00002`
- Click: "Search"

**3. Jika webhook sudah dijalankan**:

- Status akan berubah menjadi "COMPLETED"
- Stock akan ter-update di tabel bawah

---

## Available Products

Produk yang tersedia di database:

| SKU           | Name           | ID                                   |
| ------------- | -------------- | ------------------------------------ |
| FRESHLEMON    | Fresh Lemon    | 5c7ad089-4b87-4c68-b1b6-cfbb71c66fa7 |
| ICYMINT       | Icy Mint       | 72c26f3e-864f-400a-b07d-afb9ebb0d45e |
| ICYWATERMELON | Icy Watermelon | e6c38e39-6b62-41cb-9c72-b9ac24e28a56 |
| STRAWBLISS    | Straw Bliss    | b8e1f5c2-3d9f-4a2b-8c1a-5e9d7f2a1b3c |
| VANADREAM     | Vana Dream     | 7a2f1d9e-8b4c-4e5d-9c3a-1f2e3d4c5b6a |

---

## Testing Purchase Requests

### PR00001

- **ID**: 043cd35e-5687-4345-9a0b-32ccc4da7e09
- **Reference**: PR00001
- **Status**: PENDING
- **Warehouse**: Surabaya Warehouse
- **Items**: Icy Mint (15 qty)

**Webhook Payload**:

```json
{
  "vendor": "FOOMLAB",
  "reference": "PR00001",
  "qty_total": 15,
  "details": [
    {
      "product_name": "Icy Mint",
      "sku_barcode": "ICYMINT",
      "qty": 15
    }
  ]
}
```

### PR00002

- **ID**: 8b102730-4528-4062-b1c8-0811900312e6
- **Reference**: PR00002
- **Status**: PENDING
- **Warehouse**: Surabaya Warehouse
- **Items**: Icy Mint (15 qty)

**Webhook Payload**:

```json
{
  "vendor": "FOOMLAB",
  "reference": "PR00002",
  "qty_total": 15,
  "details": [
    {
      "product_name": "Icy Mint",
      "sku_barcode": "ICYMINT",
      "qty": 15
    }
  ]
}
```

---

## Step-by-Step Guide: Complete Workflow

### 1. Start All Services

**Terminal 1 - Backend**:

```bash
cd /Volumes/project-danu/foom/backend
npm run dev
# Tunggu sampai: "Server is running on port 3000"
```

**Terminal 2 - Frontend**:

```bash
cd /Volumes/project-danu/foom/frontend
npm run dev
# Tunggu sampai: "ready - started server on 0.0.0.0:3001"
```

**Terminal 3 - Localtunnel**:

```bash
npx localtunnel --port 3000 --subdomain sad-rules-dress
# Tunggu sampai: "your url is: https://sad-rules-dress.loca.lt"
```

### 2. Verify Setup

**Check Backend**:

```bash
curl -H "x-api-key: Testing1" http://localhost:3000/api/products
# Should return array of products
```

**Check Frontend**:

```bash
curl http://localhost:3001
# Should return HTML page
```

**Check Localtunnel**:

```bash
curl https://sad-rules-dress.loca.lt/api/products -H "x-api-key: Testing1"
# Should return same as backend
```

### 3. Send Webhook Request

**Option A - Local (Fastest)**:

```bash
curl -X POST http://localhost:3000/api/webhook/receive-stock \
  -H "Content-Type: application/json" \
  -d '{
    "vendor": "FOOMLAB",
    "reference": "PR00002",
    "qty_total": 15,
    "details": [
      {
        "product_name": "Icy Mint",
        "sku_barcode": "ICYMINT",
        "qty": 15
      }
    ]
  }'
```

**Option B - Via Tunnel (Simulates hub.foomid.id)**:

```bash
curl -X POST https://sad-rules-dress.loca.lt/api/webhook/receive-stock \
  -H "Content-Type: application/json" \
  -d '{
    "vendor": "FOOMLAB",
    "reference": "PR00002",
    "qty_total": 15,
    "details": [
      {
        "product_name": "Icy Mint",
        "sku_barcode": "ICYMINT",
        "qty": 15
      }
    ]
  }'
```

### 4. Verify Results

**Check Stock Updated**:

```bash
curl -H "x-api-key: Testing1" "http://localhost:3000/api/stocks?warehouse_id=369e1f04-ea77-4b84-af61-0b232b384d12"
# ICYMINT stock should be 15
```

**Check PR Status**:

```bash
curl -H "x-api-key: Testing1" "http://localhost:3000/api/purchase/request/reference/PR00002"
# Status should be "COMPLETED"
```

**Check Frontend Dashboard**:

1. Open http://localhost:3001
2. In "Track Purchase Request" section, search for "PR00002"
3. Should show status "COMPLETED" and items received

---

## Common Errors & Solutions

### Error: "Route not found"

**Cause**: Backend not running or route not registered
**Solution**:

```bash
# Check if backend is running
ps aux | grep "node.*server"
# If not, start it:
cd /Volumes/project-danu/foom/backend && npm run dev
```

### Error: "Vendor not found"

**Cause**: Vendor name doesn't match
**Solution**: Check backend .env file:

```bash
# Should have:
VENDOR_NAME=FOOMLAB
```

### Error: "Purchase request not found"

**Cause**: Reference doesn't match any PR in database
**Solution**: Verify PR exists:

```bash
curl -H "x-api-key: Testing1" "http://localhost:3000/api/purchase/request"
# Look for the reference you're using
```

### Error: "Product not found"

**Cause**: SKU doesn't match any product
**Solution**: Check available products:

```bash
curl -H "x-api-key: Testing1" "http://localhost:3000/api/products" | jq '.data[] | {name, sku}'
```

### Error: "Cannot GET /api/webhook/receive-stock"

**Cause**: Using GET instead of POST
**Solution**: Make sure to use `-X POST` in curl

### Error: "SSL: CERTIFICATE_VERIFY_FAILED"

**Cause**: Localtunnel certificate issue
**Solution**: Use curl with `-k` flag:

```bash
curl -k -X POST https://sad-rules-dress.loca.lt/api/webhook/receive-stock \
  -H "Content-Type: application/json" \
  -d '...'
```

---

## Workflow Verification Checklist

- [ ] Backend running on port 3000
- [ ] Frontend running on port 3001
- [ ] Localtunnel running with sad-rules-dress.loca.lt
- [ ] curl test to `/api/products` returns data
- [ ] Purchase request PR00002 exists in database
- [ ] Webhook payload has correct vendor name (FOOMLAB)
- [ ] Webhook payload has correct PR reference (PR00002)
- [ ] Webhook request returns status 200
- [ ] PR status changed to COMPLETED
- [ ] Stock quantity updated in database
- [ ] Frontend dashboard shows updated status

---

## Advanced Testing

### Test Multiple Items in One Webhook

```bash
curl -X POST http://localhost:3000/api/webhook/receive-stock \
  -H "Content-Type: application/json" \
  -d '{
    "vendor": "FOOMLAB",
    "reference": "PR00001",
    "qty_total": 30,
    "details": [
      {
        "product_name": "Icy Mint",
        "sku_barcode": "ICYMINT",
        "qty": 15
      },
      {
        "product_name": "Fresh Lemon",
        "sku_barcode": "FRESHLEMON",
        "qty": 15
      }
    ]
  }'
```

### Test with Different Warehouses

Get warehouse list:

```bash
curl -H "x-api-key: Testing1" "http://localhost:3000/api/warehouses"
```

Then create new PR with different warehouse:

```bash
curl -X POST http://localhost:3000/api/purchase/request \
  -H "Content-Type: application/json" \
  -H "x-api-key: Testing1" \
  -d '{
    "warehouse_id": "WAREHOUSE_ID_HERE",
    "reference": "PR00003",
    "items": [
      {
        "product_id": "72c26f3e-864f-400a-b07d-afb9ebb0d45e",
        "quantity": 20
      }
    ]
  }'
```

---

## Backend Logs

Monitor backend console untuk webhook logs:

```
[Webhook] Received stock receipt from vendor: FOOMLAB
[Webhook] Processing reference: PR00002
[Webhook] Updated stock for ICYMINT: 15 units
[Webhook] Updated PR status to COMPLETED
```

---

## Next Steps

1. **Test locally first** dengan method curl
2. **Verify via tunnel** untuk memastikan hub.foomid.id bisa akses
3. **Test via frontend dashboard** untuk UX verification
4. **Check database** untuk memastikan data ter-update
5. **Ready untuk production** webhook integration

---

## Contact & Support

- Backend: http://localhost:3000
- Frontend: http://localhost:3001
- API Docs: `/Volumes/project-danu/foom/backend/API_DOCUMENTATION.md`
- Webhook Docs: `/Volumes/project-danu/foom/backend/WEBHOOK.md`
