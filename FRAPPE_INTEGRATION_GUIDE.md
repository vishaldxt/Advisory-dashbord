# Frappe Backend Integration Guide

## 📋 Overview
Your React dashboard is now configured to fetch real data from your Frappe backend APIs. Follow these steps to connect everything.

---

## 🔧 Setup Steps

### Step 1: Configure Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set your Frappe site URL:
   ```env
   VITE_FRAPPE_URL=http://localhost:8000
   ```
   
   Or for production:
   ```env
   VITE_FRAPPE_URL=https://your-frappe-site.com
   ```

### Step 2: Enable CORS on Your Frappe Site
Add this to your Frappe site's `site_config.json`:

```json
{
  "allow_cors": "*",
  "cors_allow_credentials": true,
  "cors_allow_headers": [
    "Content-Type",
    "Authorization",
    "Accept"
  ]
}
```

Then restart your Frappe bench:
```bash
bench restart
```

### Step 3: Update React Code to Use Your Store
In `src/pages/Index.tsx`, find this line (around line 231):

```typescript
const storeName = undefined; // Example: "STORE-0001"
```

Replace with your actual Store document name:
```typescript
const storeName = "STORE-0001"; // Your actual store name from Frappe
```

### Step 4: Restart Your React Dev Server
```bash
npm run dev
```

---

## 🎯 How It Works

### Data Flow:
1. **React Frontend** (`src/pages/Index.tsx`) calls `useAdvisoryData` hook
2. **Hook** (`src/hooks/useAdvisoryData.ts`) fetches data using API service
3. **API Service** (`src/services/api.ts`) calls Frappe's `fetch_all_api_data` method
4. **Frappe Backend** (`store.py`) aggregates all API data
5. **Advisory APIs** (`advisory_settings.py`) fetch from external weather services
6. **Data** flows back to React and displays in dashboard

### Sample vs Real Data:
- **Sample Data Mode**: When `storeName = undefined` or API fails
- **Live Data Mode**: When `storeName` is set and API succeeds
- Status indicator shows which mode is active

---

## 🔍 Testing the Integration

### Test 1: Verify API Endpoint
Open browser console and test the API:
```javascript
fetch('http://localhost:8000/api/method/mdc.advisory.doctype.store.store.Store.fetch_all_api_data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ doc: 'STORE-0001' })
})
.then(r => r.json())
.then(d => console.log(d));
```

### Test 2: Check Frappe Store Document
1. Login to your Frappe site
2. Go to: Store > [Your Store Name]
3. Click "Fetch Advisory Dashboard" button
4. Verify data is populated

### Test 3: React Dashboard
1. Open React app: `http://localhost:5173`
2. Check status indicator: Should show "✅ Live Data from Frappe"
3. Verify data cards display real values

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch advisory data"
**Solutions:**
- ✅ Verify Frappe site is running
- ✅ Check CORS settings in `site_config.json`
- ✅ Ensure `storeName` matches exact Frappe document name
- ✅ Check browser console for detailed errors

### Issue: "CORS policy blocked"
**Solutions:**
- ✅ Add CORS config to Frappe `site_config.json`
- ✅ Restart Frappe bench: `bench restart`
- ✅ Clear browser cache

### Issue: "401 Unauthorized"
**Solutions:**
- ✅ Login to Frappe site in same browser
- ✅ Ensure `credentials: 'include'` in fetch calls
- ✅ Check Frappe user permissions

### Issue: Data not updating
**Solutions:**
- ✅ Click "Fetch Advisory Dashboard" in Frappe Store document
- ✅ Check `api_data_runtime` field in Store document
- ✅ Verify lat/long and crop fields are set

---

## 📁 File Structure

```
React App:
├── src/
│   ├── services/
│   │   └── api.ts                    # API calls to Frappe
│   ├── hooks/
│   │   └── useAdvisoryData.ts        # Data fetching hook
│   ├── pages/
│   │   └── Index.tsx                 # Main dashboard (updated)
│   └── components/                   # All card components
└── .env                              # Frappe URL config

Frappe Backend:
└── mdc/advisory/doctype/
    ├── advisory_settings/
    │   └── advisory_settings.py      # API wrapper functions
    └── store/
        ├── store.py                  # Data aggregation
        └── store.js                  # Frappe UI (optional)
```

---

## 🚀 Next Steps

1. **Production Deployment:**
   - Set production Frappe URL in `.env`
   - Deploy React app
   - Configure production CORS properly

2. **Authentication:**
   - Add login page if needed
   - Implement token-based auth
   - Handle session expiry

3. **Real-time Updates:**
   - Add refresh button
   - Implement auto-refresh interval
   - Add WebSocket support for live data

4. **Error Handling:**
   - Add retry logic
   - Implement offline mode
   - Show detailed error messages

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check Frappe logs: `bench logs`
3. Verify API responses in Network tab
4. Test Frappe methods directly via API browser

---

**Status:** ✅ Integration Complete - Ready to Test!
