# Inventory Allocation System - Frontend

Next.js 14 frontend application for the Inventory Allocation System. Built with App Router, TypeScript, Tailwind CSS, and Zustand.

## Setup

### Prerequisites

- Node.js 18+
- Backend running on http://localhost:3000

### Installation

```bash
npm install
```

### Environment Setup

```bash
cp .env.example .env.local
```

Update `.env.local` with your backend URL and API key:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_API_KEY=Testing1
```

### Running Development Server

```bash
npm run dev
```

Visit http://localhost:3000 in your browser.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with navigation
│   ├── page.tsx                # Stock Dashboard
│   └── purchase-requests/
│       ├── page.tsx            # Purchase Requests List
│       ├── create/
│       │   └── page.tsx        # Create Purchase Request Form
│       └── [id]/
│           └── page.tsx        # Purchase Request Details & Edit
├── components/
│   ├── layout.tsx              # Header & Footer components
│   └── ui.tsx                  # UI utilities (Button, alerts, spinners)
├── lib/
│   ├── api.ts                  # Axios API client
│   └── store.ts                # Zustand state management
└── styles/
    └── globals.css             # Global styles
```

## Pages

### Stock Dashboard (`/`)

- Display inventory levels in a table format
- Columns: Product Name, SKU, Warehouse Name, Current Quantity
- Filter by warehouse or product
- Real-time data fetching

### Purchase Requests List (`/purchase-requests`)

- Display all purchase requests
- Columns: Reference, Warehouse, Total Quantity, Status, Date, Actions
- Search by reference number
- Link to detail view for each request
- Status badges (DRAFT, PENDING, COMPLETED)

### Create Purchase Request (`/purchase-requests/create`)

- Form to create new purchase request
- Select warehouse from dropdown
- Dynamic item rows:
  - Product selection dropdown
  - Quantity input
  - Add/remove item buttons
- Form validation before submission
- Success/error messages

### Purchase Request Details (`/purchase-requests/[id]`)

- View purchase request details
- Show request metadata (Reference, Status, Warehouse, Date)
- Display line items in table format
- Update status (DRAFT → PENDING)
- Delete option (only for DRAFT)
- Status-specific messages (PENDING, COMPLETED)

## Components

### UI Components (`src/components/ui.tsx`)

- **ErrorAlert**: Displays error messages
- **SuccessAlert**: Displays success messages
- **LoadingSpinner**: Loading indicator
- **Button**: Reusable button with loading state

### Layout Components (`src/components/layout.tsx`)

- **Header**: Navigation bar with links
- **Footer**: Footer with copyright

## API Client (`src/lib/api.ts`)

Axios instance with automatic error handling and response transformation.

**Methods:**

- `api.products.getAll()` - Get all products
- `api.stocks.getAll(warehouseId?, productId?)` - Get stocks with optional filters
- `api.purchaseRequests.getAll()` - Get all purchase requests
- `api.purchaseRequests.getById(id)` - Get single purchase request
- `api.purchaseRequests.create(data)` - Create new request
- `api.purchaseRequests.update(id, data)` - Update request
- `api.purchaseRequests.delete(id)` - Delete request
- `api.webhooks.receiveStock(data)` - Simulate webhook

## State Management (`src/lib/store.ts`)

Using Zustand for global state:

- `useError`: Error state and methods
- `useLoading`: Loading state for global operations

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Responsive Design**: Mobile-first approach
- **Color Scheme**: Blue primary, gray secondary, green success, red danger

## Features

### Form Handling

- React Hook Form integration ready
- Client-side validation
- Server-side error handling

### Data Fetching

- Axios with interceptors
- Automatic API key injection
- Error response handling
- Loading states for all async operations

### User Experience

- Loading spinners while fetching data
- Error messages for failed operations
- Success messages for completed actions
- Responsive tables with hover effects
- Disabled buttons during submission

## Build

```bash
npm run build
```

## Production

```bash
npm run start
```

## Environment Variables

### Development (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_API_KEY=Testing1
```

### Production (.env.production)

```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_KEY=your_production_api_key
```

## Performance

- App Router for efficient routing
- Lazy loading components
- Optimized CSS with Tailwind
- Client-side state management

## Troubleshooting

### API Connection Issues

1. Verify backend is running: `curl http://localhost:3000/health`
2. Check NEXT_PUBLIC_API_URL in .env.local
3. Verify API_KEY matches backend configuration

### Build Errors

```bash
# Clear cache
rm -rf .next
npm run dev
```

### Port Already In Use

```bash
# Change port
PORT=3001 npm run dev
```

## Development Tips

- Use browser DevTools Network tab to inspect API calls
- Check browser Console for error messages
- Use React DevTools extension for debugging
- Test forms with invalid data
- Verify error handling paths

## Technologies

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Zustand** - State management
- **Lucide React** - Icons (optional)
