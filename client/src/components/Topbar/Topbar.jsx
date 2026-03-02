import { Link, useLocation } from 'react-router-dom'
import { useWorkflow } from '../../context/WorkflowContext'

const NAV = [
  { to: '/',           label: 'Dashboard', icon: '⬡' },
  { to: '/executions', label: 'History',   icon: '◎' },
]

const STATUS_CONFIG = {
  live:       { color: '#22c55e', label: 'LIVE',  pulse: true  },
  stale:      { color: '#f59e0b', label: 'STALE', pulse: false },
  error:      { color: '#ef4444', label: 'ERROR', pulse: false },
  connecting: { color: '#94a3b8', label: '...',   pulse: false },
}

export default function Topbar({ workflowName, setWorkflowName, onActivate, isActive, nodeCount, edgeCount, isBuilder }) {
  const location = useLocation()
  const { prices, priceChanges, priceStatus } = useWorkflow()
  const statusCfg = STATUS_CONFIG[priceStatus || 'connecting']

  return (
    <header style={{
      height: 52,
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      gap: 0, flexShrink: 0, zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', borderRight: '1px solid var(--border)', height: '100%' }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>⚡</div>
        <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, letterSpacing: 2 }}>TRADEFLOW</span>
      </div>

      {!isBuilder && (
        <nav style={{ display: 'flex', height: '100%', borderRight: '1px solid var(--border)' }}>
          {NAV.map(({ to, label, icon }) => {
            const active = location.pathname === to
            return (
              <Link key={to} to={to} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 18px', color: active ? 'var(--accent-yellow)' : 'var(--text-muted)', fontSize: 12, fontWeight: active ? 600 : 400, borderBottom: active ? '2px solid var(--accent-yellow)' : '2px solid transparent', transition: 'color 0.15s' }}>
                <span>{icon}</span> {label}
              </Link>
            )
          })}
        </nav>
      )}

      {isBuilder && (
        <>
          <div style={{ padding: '0 16px', borderRight: '1px solid var(--border)', height: '100%', display: 'flex', alignItems: 'center' }}>
            <Link to="/" style={{ color: 'var(--text-muted)', fontSize: 11 }}>← Dashboard</Link>
          </div>
          <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--text-faint)', fontSize: 11 }}>◎</span>
            <input value={workflowName} onChange={e => setWorkflowName?.(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: 13, width: 220 }} />
          </div>
          <div style={{ display: 'flex', gap: 20, padding: '0 16px', borderLeft: '1px solid var(--border)' }}>
            {[{ label: 'NODES', val: nodeCount, color: 'var(--accent-blue)' }, { label: 'EDGES', val: edgeCount, color: 'var(--accent-green)' }].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ color: s.color, fontSize: 15, fontWeight: 700 }}>{s.val}</div>
                <div style={{ color: 'var(--text-faint)', fontSize: 9, letterSpacing: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Live price ticker */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 28, padding: '0 24px', overflow: 'hidden', justifyContent: 'center' }}>
        {/* Status dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusCfg.color, boxShadow: statusCfg.pulse ? `0 0 6px ${statusCfg.color}` : 'none', animation: statusCfg.pulse ? 'pulse-dot 2s ease-in-out infinite' : 'none' }} />
          <span style={{ color: statusCfg.color, fontSize: 8, fontWeight: 700, letterSpacing: 1 }}>{statusCfg.label}</span>
        </div>

        {Object.entries(prices).map(([sym, price]) => {
          const change = priceChanges?.[sym] ?? 0
          const up = change >= 0
          return (
            <div key={sym} style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span style={{ color: 'var(--text-faint)', fontSize: 10, fontWeight: 700 }}>{sym}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                ${sym === 'DOGE' ? price.toFixed(4) : price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span style={{ color: up ? '#22c55e' : '#ef4444', fontSize: 9, fontWeight: 600 }}>
                {up ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
              </span>
            </div>
          )
        })}
      </div>

      {isBuilder && (
        <div style={{ padding: '0 16px', borderLeft: '1px solid var(--border)', height: '100%', display: 'flex', alignItems: 'center' }}>
          <button onClick={onActivate} style={{ background: isActive ? '#14532d' : 'transparent', border: `1px solid ${isActive ? 'var(--accent-green)' : 'var(--accent-yellow)'}`, color: isActive ? 'var(--accent-green)' : 'var(--accent-yellow)', padding: '7px 22px', borderRadius: 'var(--radius-sm)', fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-mono)' }}>
            {isActive ? '◼ DEACTIVATE' : '▶ ACTIVATE'}
          </button>
        </div>
      )}

      {!isBuilder && (
        <div style={{ padding: '0 16px', borderLeft: '1px solid var(--border)', height: '100%', display: 'flex', alignItems: 'center' }}>
          <Link to="/builder/new">
            <button style={{ background: 'linear-gradient(135deg, #f59e0b22, #ef444422)', border: '1px solid var(--accent-yellow)', color: 'var(--accent-yellow)', padding: '7px 18px', borderRadius: 'var(--radius-sm)', fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
              + NEW WORKFLOW
            </button>
          </Link>
        </div>
      )}
    </header>
  )
}