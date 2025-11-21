# API Documentation Tools & Setup Guide

## Dokumentasi API yang Tersedia

Kami telah membuat 3 format dokumentasi untuk kemudahan testing dan reference:

### 1. **Markdown Documentation** ✅ RECOMMENDED

**File**: `API_DOCUMENTATION.md`

**Kelebihan:**

- Format simple dan mudah dibaca
- Include semua contoh cURL commands
- Response examples lengkap
- Error scenarios documented
- Best practices included
- Bisa langsung di-copy dari browser

**Cara Menggunakan:**

```bash
# Buka di terminal atau text editor
cat API_DOCUMENTATION.md

# Atau buka di browser
open API_DOCUMENTATION.md
```

---

### 2. **OpenAPI/Swagger** ✅ PROFESSIONAL

**File**: `openapi.yaml`

**Kelebihan:**

- Standard industri untuk API documentation
- Auto-generates interactive UI
- Schema validation included
- Version control friendly

**Cara Setup Swagger UI:**

**Option A: Online Swagger Editor**

1. Buka https://editor.swagger.io/
2. Copy-paste isi file `openapi.yaml`
3. Langsung bisa test endpoints

**Option B: Local Swagger UI (Docker)**

```bash
docker run -p 8080:8080 -e SWAGGER_JSON=/foo/openapi.yaml -v $(pwd):/foo swaggerapi/swagger-ui
```

Buka: http://localhost:8080

**Option C: npm install locally**

```bash
npm install -g swagger-ui
swagger-ui ./openapi.yaml
```

---

### 3. **Postman Collection** 🔄 COMING SOON

**File**: `Postman_Collection.json`

**Status**: File ada tapi perlu diperbaiki formatting JSON-nya

**Cara Menggunakan (setelah fixed):**

1. **Install Postman**: https://www.postman.com/downloads/

2. **Import Collection**:

   - Buka Postman
   - Click: File → Import
   - Select: `Postman_Collection.json`
   - Click: Import

3. **Setup Environment Variables**:

   - Create new Environment
   - Add variables:
     ```
     base_url = http://localhost:3000
     api_key = your-secret-api-key-here
     purchase_request_id = (set setelah create PR)
     ```

4. **Run Requests**:
   - Select environment
   - Browse requests in left sidebar
   - Click request → Send
   - View response

**Keuntungan Postman:**

- Interactive request builder
- Auto format JSON
- Save request history
- Pre-request scripts
- Tests verification
- Share dengan team

---

## Response Format Standardisasi

Semua API endpoints menggunakan format response yang standardisasi:

### Success Format

```javascript
{
  status: "success",              // ✅ Selalu "success"
  statusCode: 200,                // HTTP status code
  message: "Descriptive message", // User-friendly message
  data: { ... },                  // Actual response data
  error: null,                    // Always null for success
  timestamp: "2025-11-21T..."     // ISO timestamp
}
```

### Error Format

```javascript
{
  status: "error",                // ✅ Selalu "error"
  statusCode: 400,                // HTTP status code
  message: "Error description",   // User-friendly message
  data: null,                     // Usually null
  error: {                        // Error details
    type: "VALIDATION_ERROR",     // Error type
    details: "..."                // Additional details
  },
  timestamp: "2025-11-21T..."     // ISO timestamp
}
```

---

## HTTP Status Codes Reference

```javascript
{
  200: "OK - Request successful",
  201: "Created - Resource created",
  400: "Bad Request - Validation error",
  401: "Unauthorized - Missing API key",
  403: "Forbidden - Invalid vendor",
  404: "Not Found - Resource not found",
  409: "Conflict - Idempotency (already processed)",
  500: "Internal Server Error"
}
```

---

## Quick Testing Guide

### Test dengan cURL (Paling Simple)

**1. Get All Products:**

```bash
curl -X GET 'http://localhost:3000/products' \
  -H 'x-api-key: your-secret-api-key-here' \
  -H 'Content-Type: application/json'
```

**2. Get Stock Levels:**

```bash
curl -X GET 'http://localhost:3000/stocks' \
  -H 'x-api-key: your-secret-api-key-here' \
  -H 'Content-Type: application/json'
```

**3. Create Purchase Request:**

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

**4. Update to PENDING:**

```bash
curl -X PUT 'http://localhost:3000/purchase/request/550e8400-e29b-41d4-a716-446655440020' \
  -H 'x-api-key: your-secret-api-key-here' \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "PENDING"
  }'
```

**5. Webhook - Receive Stock:**

```bash
curl -X POST 'http://localhost:3000/webhook/receive-stock' \
  -H 'x-api-key: your-secret-api-key-here' \
  -H 'Content-Type: application/json' \
  -d '{
    "vendor": "PT FOOM LAB GLOBAL",
    "reference": "PR000123456",
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

---

## Tools Comparison

| Feature            | cURL         | Postman            | Swagger UI     | API Documentation  |
| ------------------ | ------------ | ------------------ | -------------- | ------------------ |
| **Setup Time**     | Instant      | 5 min              | 2 min          | Instant            |
| **Learning Curve** | Moderate     | Easy               | Easy           | Easy               |
| **Interactive**    | No           | Yes                | Yes            | No                 |
| **Save Requests**  | No           | Yes                | No             | Yes (as bookmarks) |
| **Team Sharing**   | No           | Yes                | Yes            | Yes (GitHub)       |
| **Testing**        | Manual       | Built-in           | Built-in       | Manual             |
| **Documentation**  | Command line | GUI                | Auto-generated | Static             |
| **Export**         | No           | Yes (many formats) | Yes (JSON)     | Markdown           |

---

## Recommended Workflow

### For Development

1. **Start with**: cURL commands dari `API_DOCUMENTATION.md`
2. **Switch to**: Postman untuk complex testing
3. **Reference**: `openapi.yaml` untuk API specs

### For Documentation

1. **Share**: `API_DOCUMENTATION.md` dengan team
2. **Host**: `openapi.yaml` di Swagger UI
3. **Generate**: API docs portal dengan ReDoc

### For Production

1. **Use**: Postman untuk monitoring
2. **Monitor**: Webhook responses
3. **Track**: API analytics

---

## Setting Up Swagger UI for Production

### Option 1: Docker Compose

Create `docker-compose.yml`:

```yaml
version: "3.8"
services:
  swagger-ui:
    image: swaggerapi/swagger-ui:latest
    ports:
      - "8080:8080"
    environment:
      SWAGGER_JSON: /openapi.yaml
    volumes:
      - ./openapi.yaml:/openapi.yaml
```

Run:

```bash
docker-compose up
```

### Option 2: Express Server

Install swagger packages:

```bash
npm install swagger-jsdoc swagger-ui-express
```

Update `server.js`:

```javascript
const swaggerUi = require("swagger-ui-express");
const YAML = require("yaml");
const fs = require("fs");

const swaggerDoc = YAML.parse(fs.readFileSync("./openapi.yaml", "utf-8"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
```

Access: http://localhost:3000/api-docs

---

## Generating API Clients

### From OpenAPI/Swagger

Using OpenAPI Generator:

```bash
# Install
npm install -g @openapitools/openapi-generator-cli

# Generate JavaScript client
openapi-generator-cli generate \
  -i ./openapi.yaml \
  -g javascript \
  -o ./generated-client
```

### Using Postman

1. Open Postman Collection
2. Click "..." → Generate code snippets
3. Choose language (JavaScript, Python, Go, etc.)
4. Copy code

---

## API Key Management

### For Development

```bash
# In .env
API_KEY=your-secret-api-key-here
```

### For Testing

```bash
# Store in environment variable
export API_KEY="your-secret-api-key-here"

# Use in curl
curl -H "x-api-key: $API_KEY" ...
```

### For Production

```bash
# Use secrets management
# - GitHub Secrets
# - AWS Secrets Manager
# - HashiCorp Vault
# - 1Password
```

---

## Troubleshooting

### Common Issues

**1. 401 Unauthorized**

```
Error: Missing or invalid API key
Solution: Add x-api-key header
```

**2. 404 Not Found**

```
Error: Resource with ID not found
Solution: Verify ID exists, check if resource was deleted
```

**3. 409 Conflict**

```
Error: Webhook already processed (idempotency)
Solution: This is expected for duplicate requests
```

**4. 400 Bad Request**

```
Error: Validation failed
Solution: Check required fields in request body
```

---

## Next Steps

1. ✅ Start with `API_DOCUMENTATION.md`
2. ✅ Test with cURL commands
3. ✅ Import to Postman for convenience
4. ✅ Setup Swagger UI for team
5. ✅ Generate API clients if needed

---

## Resources

- **Postman Docs**: https://learning.postman.com/
- **OpenAPI Spec**: https://spec.openapis.org/
- **Swagger Editor**: https://editor.swagger.io/
- **cURL Manual**: https://curl.se/docs/manual.html
- **HTTP Status Codes**: https://httpwg.org/specs/rfc7231.html

---

## Support

Untuk pertanyaan atau issues:

1. Check `API_DOCUMENTATION.md` first
2. Review error response details
3. Check logs di server terminal
4. Refer to `MVC_ARCHITECTURE.md` untuk implementation details
