import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useWorkflow } from '../context/WorkflowContext'
import Topbar from '../components/Topbar/Topbar'
import { formatDate } from '../utils/helpers'
import { NODE_TYPES } from '../constants/nodeTypes'

const STATUS_STYLE = {
  success: { color: '#34d399', bg: '#064e3b', label: '✓ Success' },
  failure: { color: '#f87171', bg: '#7f1d1d', label: '✗ Failed'  },
  pending: { color: '#fbbf24', bg: '#78350f', label: '⏳ Pending' },
}

function ExecRow({ exec, index }) {
  const status = STATUS_STYLE[exec.status] || STATUS_STYLE.pending
  const def    = NODE_TYPES[exec.nodeType]
  const isEven = index % 2 === 0

  return (
    <tr style={{ background: isEven ? 'var(--bg-surface)' : 'var(--bg-elevated)' }}>
      <td style={td()}>{formatDate(exec.timestamp)}</td>
      <td style={td()}>
        <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{exec.workflowName}</span>
      </td>
      <td style={td()}>
        {def && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: `${def.color}18`,
            border: `1px solid ${def.color}44`,
            borderRadius: 4,
            padding: '2px 8px',
            color: def.color,
            fontSize: 10, fontWeight: 600,
          }}>
            {def.icon} {def.label}
          </span>
        )}
      </td>
      <td style={td()}>
        <span style={{ color: 'var(--accent-yellow)', fontWeight: 600, fontSize: 12 }}>{exec.asset}</span>
      </td>
      <td style={{ ...td(), textAlign: 'right' }}>
        <span style={{ color: 'var(--text-primary)', fontSize: 12 }}>{exec.qty > 0 ? exec.qty : '—'}</span>
      </td>
      <td style={{ ...td(), textAlign: 'right' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
          {exec.price > 0 ? `$${exec.price.toLocaleString()}` : '—'}
        </span>
      </td>
      <td style={{ ...td(), textAlign: 'center' }}>
        <span style={{
          background: status.bg,
          color: status.color,
          borderRadius: 4,
          padding: '2px 10px',
          fontSize: 10, fontWeight: 700,
        }}>
          {status.label}
        </span>
      </td>
    </tr>
  )
}

function td() {
  return {
    padding: '10px 14px',
    borderBottom: '1px solid var(--border)',
    color: 'var(--text-muted)',
    fontSize: 11,
    fontFamily: 'var(--font-mono)',
  }
}

export default function ExecutionHistory() {
  const { executions, workflows } = useWorkflow()
  const [searchParams] = useSearchParams()
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterWf, setFilterWf]         = useState(searchParams.get('workflow') || 'all')
  const [search, setSearch]             = useState('')

  const filtered = executions.filter(e => {
    if (filterStatus !== 'all' && e.status !== filterStatus) return false
    if (filterWf !== 'all' && e.workflowId !== filterWf) return false
    if (search && !e.workflowName.toLowerCase().includes(search.toLowerCase()) && !e.asset.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const successCount = executions.filter(e => e.status === 'success').length
  const failCount    = executions.filter(e => e.status === 'failure').length

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Topbar />

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Title */}
        <div>
          <h1 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
            Execution History
          </h1>
          <p style={{ color: 'var(--text-faint)', fontSize: 12 }}>All trade executions across your workflows</p>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'flex', gap: 14 }}>
          {[
            { label: 'Total Executions', val: executions.length, color: 'var(--accent-blue)'  },
            { label: 'Successful',       val: successCount,      color: 'var(--accent-green)' },
            { label: 'Failed',           val: failCount,         color: 'var(--accent-red)'   },
            { label: 'Success Rate',     val: executions.length ? `${Math.round((successCount/executions.length)*100)}%` : '—', color: 'var(--accent-yellow)' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--bg-surface)',
              border: `1px solid ${s.color}33`,
              borderRadius: 'var(--radius-md)',
              padding: '14px 20px',
              flex: 1,
            }}>
              <div style={{ color: s.color, fontSize: 22, fontWeight: 700 }}>{s.val}</div>
              <div style={{ color: 'var(--text-faint)', fontSize: 10, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            placeholder="Search by workflow or asset..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '7px 14px',
              fontSize: 12,
              width: 260,
            }}
          />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={filterSelect()}
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="failure">Failed</option>
            <option value="pending">Pending</option>
          </select>
          <select
            value={filterWf}
            onChange={e => setFilterWf(e.target.value)}
            style={filterSelect()}
          >
            <option value="all">All Workflows</option>
            {workflows.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <span style={{ color: 'var(--text-faint)', fontSize: 11, marginLeft: 'auto' }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Table */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-base)' }}>
                {['Time', 'Workflow', 'Action', 'Asset', 'Quantity', 'Price', 'Status'].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px',
                    color: 'var(--text-faint)',
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: 1.5,
                    textAlign: h === 'Quantity' || h === 'Price' ? 'right' : h === 'Status' ? 'center' : 'left',
                    borderBottom: '1px solid var(--border)',
                    textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-faint)', fontSize: 12 }}>
                    No executions found.
                  </td>
                </tr>
              ) : (
                filtered.map((exec, i) => <ExecRow key={exec.id} exec={exec} index={i} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function filterSelect() {
  return {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    borderRadius: 'var(--radius-sm)',
    padding: '7px 12px',
    fontSize: 12,
    fontFamily: 'var(--font-mono)',
    cursor: 'pointer',
  }
}
