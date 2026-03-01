import { NODE_TYPES } from '../../constants/nodeTypes'

export default function StatusBar({ connecting, dragging, selectedNodeId, nodes, isActive }) {
  const selectedNode = nodes.find(n => n.id === selectedNodeId)

  const status = connecting
    ? `● CONNECTING — drop on an Action node's input port`
    : dragging
    ? `↔ DRAGGING NODE`
    : selectedNode
    ? `◉ SELECTED: ${NODE_TYPES[selectedNode.type]?.label}`
    : `○ READY — drag nodes or click a port to connect`

  return (
    <div style={{
      height: 26,
      background: '#06080f',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      padding: '0 14px',
      flexShrink: 0,
    }}>
      <span style={{ color: '#1a2030', fontSize: 9, fontFamily: 'var(--font-mono)' }}>
        TRADEFLOW v0.1.0
      </span>
      <span style={{ color: '#1a2030', fontSize: 9 }}>◆</span>
      <span style={{ color: 'var(--text-faint)', fontSize: 9, fontFamily: 'var(--font-mono)' }}>
        {status}
      </span>
      <div style={{ flex: 1 }} />
      <span style={{
        color: isActive ? 'var(--accent-green)' : 'var(--text-faint)',
        fontSize: 9, fontFamily: 'var(--font-mono)',
      }}>
        {isActive ? '▶ EXECUTOR RUNNING' : '◼ EXECUTOR IDLE'}
      </span>
    </div>
  )
}
