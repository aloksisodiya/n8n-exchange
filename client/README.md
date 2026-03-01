# TradeFlow — Client

React frontend for the TradeFlow automated trading workflow builder.

## Setup

```bash
cd client
npm install
npm run dev
```

Runs on http://localhost:5173

Backend (when ready) should run on http://localhost:5000 — Vite will proxy `/api/*` calls automatically.

## Folder Structure

```
client/
├── public/
├── src/
│   ├── components/
│   │   ├── Canvas/
│   │   │   ├── Canvas.jsx       ← Main drag-drop canvas
│   │   │   ├── NodeCard.jsx     ← Individual node UI
│   │   │   └── EdgeLayer.jsx    ← SVG bezier connections
│   │   ├── LogPanel/
│   │   │   └── LogPanel.jsx     ← Right-side execution log
│   │   ├── Sidebar/
│   │   │   └── Sidebar.jsx      ← Left node palette
│   │   ├── Topbar/
│   │   │   └── Topbar.jsx       ← Top navigation bar
│   │   └── StatusBar/
│   │       └── StatusBar.jsx    ← Bottom status strip
│   ├── constants/
│   │   └── nodeTypes.js         ← ALL node definitions live here
│   ├── context/
│   │   └── WorkflowContext.jsx  ← Global state (workflows, logs, prices)
│   ├── pages/
│   │   ├── Dashboard.jsx        ← Home — workflow cards + stats
│   │   ├── WorkflowBuilder.jsx  ← Canvas editor page
│   │   └── ExecutionHistory.jsx ← Trade history table
│   ├── services/
│   │   └── api.js               ← All backend API calls (axios)
│   ├── utils/
│   │   └── helpers.js           ← Shared utilities
│   ├── App.jsx                  ← Router setup
│   ├── main.jsx                 ← React entry point
│   └── index.css                ← Global styles + design tokens
├── index.html
├── package.json
└── vite.config.js
```

## Adding a New Node Type

Open `src/constants/nodeTypes.js` and add an entry:

```js
myNewAction: {
  label:  'My Action',
  kind:   'action',          // 'trigger' or 'action'
  color:  '#ff6b6b',
  icon:   '🔥',
  desc:   'Short description',
  fields: [
    { key: 'param1', label: 'Parameter', type: 'text', placeholder: 'value', default: '' },
    { key: 'choice', label: 'Choice',    type: 'select', options: ['A', 'B'], default: 'A' },
  ],
},
```

That's it — the node will automatically appear in the sidebar, render on the canvas, and include its fields.

## Connecting to Backend

When your backend is ready, replace the mock data in `WorkflowContext.jsx`:
- Replace `useState([...])` workflows with `useEffect` calls to `workflowAPI.getAll()`
- Replace `saveWorkflow` with `workflowAPI.create()` / `workflowAPI.update()`
- Replace mock prices with `priceAPI.getCurrent()` polling

All API functions are already written in `src/services/api.js`.
