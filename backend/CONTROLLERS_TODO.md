# Controller Implementation Guide

## Overview
All controller implementations have been removed. Each route file is set up with the proper routing structure, but you need to implement the controller functions.

## File Structure
```
backend/
├── routes/
│   ├── auth.routes.js          ✅ Routes defined
│   ├── workflow.routes.js      ✅ Routes defined
│   ├── portfolio.routes.js     ✅ Routes defined
│   └── price.routes.js         ✅ Routes defined
└── controllers/
    ├── auth.controllers.js     ⚠️ authMiddleware implemented, 4 functions need implementation
    ├── workflow.controllers.js ❌ 9 functions need implementation
    ├── portfolio.controllers.js ❌ 4 functions need implementation
    └── price.controllers.js    ❌ 3 functions need implementation
```

---

## 1. Authentication Routes (`/api/auth`)

**File:** `backend/controllers/auth.controllers.js`

### ✅ Already Implemented
- `authMiddleware` - Verifies Firebase tokens

### ❌ Need Implementation (4 functions)

#### `register(req, res)` 
**Route:** `POST /api/auth/register`
```javascript
// Body: { email, password, displayName }
// 1. Create user in Firebase Auth (adminAuth.createUser)
// 2. Create User document in MongoDB with initial wallet ($10,000)
// 3. Create empty Portfolio document
// 4. Generate custom token
// 5. Return 201 with user data and token
```

#### `login(req, res)`
**Route:** `POST /api/auth/login`
```javascript
// Body: { email }
// 1. Get user from Firebase by email
// 2. Update lastLogin in MongoDB User
// 3. Generate custom token
// 4. Return user data and token
```

#### `googleSignIn(req, res)`
**Route:** `POST /api/auth/google-signin`
```javascript
// Body: { idToken }
// 1. Verify Google ID token
// 2. Create user if doesn't exist (with wallet + portfolio)
// 3. Update lastLogin if exists
// 4. Generate custom token
// 5. Return user data and token
```

#### `logout(req, res)`
**Route:** `POST /api/auth/logout`
```javascript
// Body: { uid }
// 1. Revoke all refresh tokens using adminAuth.revokeRefreshTokens(uid)
// 2. Return success message
```

---

## 2. Workflow Routes (`/api/workflows`)

**File:** `backend/controllers/workflow.controllers.js`

All routes are **protected** (require `authMiddleware`). Access user via `req.user.uid`.

### ❌ Need Implementation (9 functions)

#### `getAllWorkflows(req, res)`
**Route:** `GET /api/workflows`
```javascript
// Query: ?isActive=true (optional)
// 1. Find workflows by userId (req.user.uid)
// 2. Filter by isActive if provided
// 3. Sort by updatedAt desc
// 4. Return array of workflows
```

#### `getWorkflowById(req, res)`
**Route:** `GET /api/workflows/:id`
```javascript
// Params: id
// 1. Find workflow by _id AND userId (security check)
// 2. Return 404 if not found
// 3. Return workflow object
```

#### `createWorkflow(req, res)`
**Route:** `POST /api/workflows`
```javascript
// Body: { name, description, nodes, edges, settings }
// 1. Create new Workflow with userId = req.user.uid
// 2. Set isActive = false by default
// 3. Save to database
// 4. Log creation event (optional)
// 5. Return 201 with created workflow
```

#### `updateWorkflow(req, res)`
**Route:** `PUT /api/workflows/:id`
```javascript
// Params: id
// Body: { name, description, nodes, edges, settings }
// 1. Find workflow by _id AND userId
// 2. Update fields
// 3. If workflow.isActive, call workflowExecutor.rescheduleWorkflow(workflow)
// 4. Save changes
// 5. Return updated workflow
```

#### `deleteWorkflow(req, res)`
**Route:** `DELETE /api/workflows/:id`
```javascript
// Params: id
// 1. Find workflow by _id AND userId
// 2. If isActive, deactivate first (unschedule cron jobs)
// 3. Delete workflow document
// 4. Optionally delete related executions
// 5. Return success message
```

#### `activateWorkflow(req, res)`
**Route:** `POST /api/workflows/:id/activate`
```javascript
// Params: id
// 1. Find workflow by _id AND userId
// 2. Validate workflow has trigger nodes (workflow.getTriggerNodes())
// 3. Call workflowExecutor.scheduleWorkflow(workflow)
// 4. Set workflow.isActive = true
// 5. Save changes
// 6. Return updated workflow
```

#### `deactivateWorkflow(req, res)`
**Route:** `POST /api/workflows/:id/deactivate`
```javascript
// Params: id
// 1. Find workflow by _id AND userId
// 2. Call workflowExecutor.unscheduleWorkflow(workflow._id.toString())
// 3. Set workflow.isActive = false
// 4. Save changes
// 5. Return updated workflow
```

#### `executeWorkflow(req, res)`
**Route:** `POST /api/workflows/:id/execute`
```javascript
// Params: id
// Body: { triggerNodeId } (optional)
// 1. Find workflow by _id AND userId
// 2. Create new Execution document (status: 'running')
// 3. Call workflowExecutor.executeWorkflow(workflow, triggerNodeId)
// 4. Wait for completion or return execution ID for async tracking
// 5. Return execution object with results
```

#### `getWorkflowExecutions(req, res)`
**Route:** `GET /api/workflows/:id/executions`
```javascript
// Params: id
// Query: ?limit=50&offset=0&status=success
// 1. Verify workflow belongs to user
// 2. Find Executions by workflowId
// 3. Filter by status if provided
// 4. Apply pagination (limit, offset)
// 5. Sort by startedAt desc
// 6. Return array of executions
```

---

## 3. Portfolio Routes (`/api/portfolio`)

**File:** `backend/controllers/portfolio.controllers.js`

All routes are **protected** (require `authMiddleware`). Access user via `req.user.uid`.

### ❌ Need Implementation (4 functions)

#### `getTransactions(req, res)`
**Route:** `GET /api/portfolio/transactions`
```javascript
// Query: ?limit=50&offset=0&symbol=BTC&type=buy&startDate=...&endDate=...
// 1. Find Transactions by userId (req.user.uid)
// 2. Filter by symbol, type, date range if provided
// 3. Apply pagination
// 4. Sort by timestamp desc
// 5. Return array of transactions
```

#### `getTransactionStats(req, res)`
**Route:** `GET /api/portfolio/transactions/stats`
```javascript
// Query: ?period=month (day, week, month, all)
// 1. Call Transaction.getUserTransactionStats(userId) 
//    OR build custom aggregation pipeline
// 2. Calculate:
//    - totalTransactions, totalBuys, totalSells
//    - totalVolume, totalProfitLoss
//    - bySymbol breakdown
// 3. Return stats object
```

#### `getPortfolio(req, res)`
**Route:** `GET /api/portfolio/portfolio`
```javascript
// 1. Find User by uid (req.user.uid) - get wallet balance
// 2. Find Portfolio by userId - get holdings
// 3. Calculate totals:
//    - totalValue (sum of all holdings at current price)
//    - totalCost (original investment)
//    - totalProfitLoss
// 4. Return { user: {...}, portfolio: {...} }
```

#### `getHoldings(req, res)`
**Route:** `GET /api/portfolio/holdings`
```javascript
// 1. Find Portfolio by userId (req.user.uid)
// 2. Return holdings array
// Each holding: { symbol, quantity, averageBuyPrice, currentPrice, profitLoss, profitLossPercent }
```

---

## 4. Price Routes (`/api/prices`)

**File:** `backend/controllers/price.controllers.js`

All routes are **PUBLIC** (no authentication required).

### ❌ Need Implementation (3 functions)

#### `getAllPrices(req, res)`
**Route:** `GET /api/prices`
```javascript
// 1. Get current prices from pricePollingService.getCurrentPrices()
//    OR MarketPrice.find()
// 2. Return array of market prices for all tracked symbols
// Each price: {
//   symbol, price, marketCap, volume24h,
//   percentChange1h, percentChange24h, percentChange7d,
//   lastUpdated, rank
// }
```

#### `getPriceBySymbol(req, res)`
**Route:** `GET /api/prices/:symbol`
```javascript
// Params: symbol (e.g., 'BTC', 'ETH')
// 1. Find MarketPrice by symbol (case-insensitive)
// 2. Return 404 if not found
// 3. Return single market price object
```

#### `getPriceHistory(req, res)`
**Route:** `GET /api/prices/:symbol/history`
```javascript
// Params: symbol
// Query: ?interval=1h&limit=100
// Valid intervals: '1m', '5m', '15m', '1h', '4h', '1d'
// 1. Validate interval and limit (max 1000)
// 2. Find PriceHistory by symbol and interval
// 3. Use getLatestDataPoints(limit) method
// 4. Return {
//     symbol,
//     interval,
//     data: [{ timestamp, open, high, low, close, volume }]
//   }
```

---

## Implementation Order (Recommended)

1. **Auth Controllers** (4 functions)
   - Start with `register` and `login` to enable user authentication
   - Then `googleSignIn` for OAuth
   - Finally `logout`

2. **Price Controllers** (3 functions)
   - These are simple read-only operations
   - No complex business logic
   - Start with `getAllPrices`, then `getPriceBySymbol`, then `getPriceHistory`

3. **Portfolio Controllers** (4 functions)
   - `getPortfolio` and `getHoldings` for viewing data
   - `getTransactions` for transaction history
   - `getTransactionStats` for analytics

4. **Workflow Controllers** (9 functions)
   - Start with CRUD: `getAllWorkflows`, `getWorkflowById`, `createWorkflow`, `updateWorkflow`, `deleteWorkflow`
   - Then lifecycle: `activateWorkflow`, `deactivateWorkflow`
   - Finally execution: `executeWorkflow`, `getWorkflowExecutions`

---

## Available Services & Models

### Services (already implemented)
```javascript
import workflowExecutor from '../services/executor.js';
import pricePollingService from '../services/pricePoller.js';

// workflowExecutor methods:
- scheduleWorkflow(workflow)
- unscheduleWorkflow(workflowId)
- rescheduleWorkflow(workflow)
- executeWorkflow(workflow, triggerNodeId)

// pricePollingService methods:
- getCurrentPrices()
- start()
- stop()
```

### Models (already implemented)
```javascript
import { 
  User, 
  Portfolio, 
  Workflow, 
  Execution, 
  Transaction, 
  MarketPrice, 
  PriceHistory, 
  Log, 
  SystemConfig, 
  NodeType 
} from '../models/index.js';
```

### Firebase Admin
```javascript
import { adminAuth } from '../config/firebase.js';

// Available methods:
- adminAuth.verifyIdToken(token)
- adminAuth.createUser(userData)
- adminAuth.getUserByEmail(email)
- adminAuth.getUser(uid)
- adminAuth.createCustomToken(uid)
- adminAuth.revokeRefreshTokens(uid)
```

---

## Testing Your Controllers

Once implemented, test each route:

```bash
# Auth
POST /api/auth/register
POST /api/auth/login
POST /api/auth/google-signin
POST /api/auth/logout

# Workflows (requires Bearer token)
GET    /api/workflows
GET    /api/workflows/:id
POST   /api/workflows
PUT    /api/workflows/:id
DELETE /api/workflows/:id
POST   /api/workflows/:id/activate
POST   /api/workflows/:id/deactivate
POST   /api/workflows/:id/execute
GET    /api/workflows/:id/executions

# Portfolio (requires Bearer token)
GET /api/portfolio/transactions
GET /api/portfolio/transactions/stats
GET /api/portfolio/portfolio
GET /api/portfolio/holdings

# Prices (public)
GET /api/prices
GET /api/prices/:symbol
GET /api/prices/:symbol/history
```

---

## Summary

**Total Functions to Implement: 20**
- ✅ 1 already done (authMiddleware)
- ❌ 4 auth functions
- ❌ 9 workflow functions
- ❌ 4 portfolio functions
- ❌ 3 price functions

Each controller file has detailed comments and hints for implementation. The routes are already configured and waiting for your controller logic!
