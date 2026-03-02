import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { timestamp, genId, MOCK_PRICES, PRICE_CHANGES } from '../utils/helpers'

const WorkflowContext = createContext(null)

export function WorkflowProvider({ children }) {
  // ── Logs ──────────────────────────────────────────────────────────────────
  const [logs, setLogs] = useState([
    { id: genId('log'), time: timestamp(), msg: 'TradeFlow system ready.', type: 'system' },
    { id: genId('log'), time: timestamp(), msg: 'Open a workflow or create a new one to get started.', type: 'system' },
  ])

  const addLog = useCallback((msg, type = 'info') => {
    setLogs(prev => [
      ...prev.slice(-299),
      { id: genId('log'), time: timestamp(), msg, type },
    ])
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([{ id: genId('log'), time: timestamp(), msg: 'Logs cleared.', type: 'system' }])
  }, [])

  // ── All saved workflows (mocked locally until backend ready) ──────────────
  const [workflows, setWorkflows] = useState([
    {
      id: 'wf-demo-1',
      name: 'DCA SOL Bot',
      isActive: false,
      nodes: [],
      edges: [],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      executions: 12,
      lastRun: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'wf-demo-2',
      name: 'SOL Stop Loss Guard',
      isActive: true,
      nodes: [],
      edges: [],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      executions: 5,
      lastRun: new Date(Date.now() - 600000).toISOString(),
    },
  ])

// ── Live prices (real data from CoinMarketCap via backend) ────────────────
const [prices, setPrices]           = useState(MOCK_PRICES)   // show mock instantly
const [priceChanges, setPriceChanges] = useState(PRICE_CHANGES)
const [priceStatus, setPriceStatus] = useState('connecting')  // 'live' | 'stale' | 'error'

useEffect(() => {
  async function fetchPrices() {
    try {
      const res  = await fetch('/api/prices')
      const json = await res.json()

      if (!json.success) throw new Error(json.error)

      // Shape into the { SOL: 149.82, BTC: 61340 } format the UI expects
      const newPrices  = {}
      const newChanges = {}
      for (const [sym, data] of Object.entries(json.data)) {
        newPrices[sym]  = data.price
        newChanges[sym] = data.change24h
      }

      setPrices(newPrices)
      setPriceChanges(newChanges)
      setPriceStatus(json.stale ? 'stale' : 'live')
    } catch (err) {
      console.error('[Prices] fetch failed:', err.message)
      setPriceStatus('error')
      // Keep showing last known prices — don't wipe them
    }
  }

  fetchPrices()                                    // run immediately on mount
  const interval = setInterval(fetchPrices, 10000) // then every 10 seconds
  return () => clearInterval(interval)
}, [])


// ── Workflow CRUD ─────────────────────────────────────────────────────────
  const saveWorkflow = useCallback((workflow) => {
    setWorkflows(prev => {
      const idx = prev.findIndex(w => w.id === workflow.id)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = { ...prev[idx], ...workflow }
        return updated
      }
      return [...prev, workflow]
    })
    addLog(`Workflow "${workflow.name}" saved.`, 'success')
  }, [addLog])

  const deleteWorkflow = useCallback((id) => {
    setWorkflows(prev => {
      const wf = prev.find(w => w.id === id)
      if (wf) addLog(`Workflow "${wf.name}" deleted.`, 'warn')
      return prev.filter(w => w.id !== id)
    })
  }, [addLog])

  const toggleWorkflow = useCallback((id) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id !== id) return w
      const next = !w.isActive
      addLog(
        next
          ? `Workflow "${w.name}" ACTIVATED — executor now running.`
          : `Workflow "${w.name}" DEACTIVATED — executor stopped.`,
        next ? 'success' : 'warn'
      )
      return { ...w, isActive: next }
    }))
  }, [addLog])

  // ── Mock execution history ────────────────────────────────────────────────
  const [executions] = useState([
    { id: 'ex-1', workflowId: 'wf-demo-1', workflowName: 'DCA SOL Bot',          nodeType: 'spotBuy',    asset: 'SOL', qty: 0.01,  price: 148.20, status: 'success', timestamp: new Date(Date.now()-  300000).toISOString() },
    { id: 'ex-2', workflowId: 'wf-demo-1', workflowName: 'DCA SOL Bot',          nodeType: 'spotBuy',    asset: 'SOL', qty: 0.01,  price: 149.10, status: 'success', timestamp: new Date(Date.now()- 9300000).toISOString() },
    { id: 'ex-3', workflowId: 'wf-demo-2', workflowName: 'SOL Stop Loss Guard',  nodeType: 'spotSell',   asset: 'SOL', qty: 0.05,  price: 143.80, status: 'success', timestamp: new Date(Date.now()-18600000).toISOString() },
    { id: 'ex-4', workflowId: 'wf-demo-1', workflowName: 'DCA SOL Bot',          nodeType: 'spotBuy',    asset: 'SOL', qty: 0.01,  price: 151.00, status: 'failure', timestamp: new Date(Date.now()-27900000).toISOString() },
    { id: 'ex-5', workflowId: 'wf-demo-2', workflowName: 'SOL Stop Loss Guard',  nodeType: 'sendEmail',  asset: 'SOL', qty: 0,     price: 0,      status: 'success', timestamp: new Date(Date.now()-37200000).toISOString() },
  ])

  return (
    <WorkflowContext.Provider value={{
      logs, addLog, clearLogs,
      workflows, saveWorkflow, deleteWorkflow, toggleWorkflow,
      prices, priceChanges,
      executions,
    }}>
      {children}
    </WorkflowContext.Provider>
  )
}

export function useWorkflow() {
  const ctx = useContext(WorkflowContext)
  if (!ctx) throw new Error('useWorkflow must be used inside WorkflowProvider')
  return ctx
}
