import { useState } from 'react'
import { NODE_TYPES } from '../../constants/nodeTypes'

export default function NodeCard({
  node,
  selected,
  onMouseDown,
  onClick,
  onPortMouseDown,
  onPortMouseUp,
  isConnecting,
  onConfigChange,
}) {
  const def = NODE_TYPES[node.type]
  if (!def) return null

  const isTargetable = isConnecting && isConnecting.nodeId !== node.id
  const isSource     = isConnecting && isConnecting.nodeId === node.id

  return (
    <div
      onMouseDown={(e) => onMouseDown(e, node.id)}
      onClick={(e) => onClick(e, node.id)}
      style={{
        position:  'absolute',
        left:      node.x,
        top:       node.y,
        width:     220,
        userSelect: 'none',
        cursor:    'grab',
        zIndex:    selected ? 10 : 5,
        filter:    selected ? `drop-shadow(0 0 14px ${def.color}66)` : 'none',
        transition: 'filter 0.15s',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      {/* ── Card ── */}
      <div style={{
        background:   selected ? 'var(--bg-elevated)' : 'var(--bg-surface)',
        border:       `1.5px solid ${selected ? def.color : 'var(--border-light)'}`,
        borderRadius: 'var(--radius-md)',
        overflow:     'hidden',
        transition:   'border-color 0.15s, background 0.15s',
      }}>
        {/* Header */}
        <div style={{
          background:   `${def.color}1a`,
          borderBottom: `1px solid ${def.color}33`,
          padding:      '8px 12px',
          display:      'flex',
          alignItems:   'center',
          gap:          8,
        }}>
          <span style={{ fontSize: 17 }}>{def.icon}</span>
          <div>
            <div style={{ color: def.color, fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              {def.kind}
            </div>
            <div style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, marginTop: 1 }}>
              {def.label}
            </div>
          </div>
        </div>

        {/* Config fields */}
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {def.fields.map(field => (
            <div key={field.key}>
              <div style={{ color: 'var(--text-faint)', fontSize: 9, marginBottom: 2 }}>{field.label}</div>
              {field.type === 'select' ? (
                <select
                  value={node.config?.[field.key] ?? field.default}
                  onChange={e => onConfigChange?.(node.id, field.key, e.target.value)}
                  onMouseDown={e => e.stopPropagation()}
                  style={{
                    width: '100%',
                    background: 'var(--bg-base)',
                    border: `1px solid var(--border)`,
                    color: def.color,
                    borderRadius: 4,
                    padding: '3px 6px',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                  }}
                >
                  {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={node.config?.[field.key] ?? field.default}
                  onChange={e => onConfigChange?.(node.id, field.key, e.target.value)}
                  onMouseDown={e => e.stopPropagation()}
                  placeholder={field.placeholder}
                  style={{
                    width: '100%',
                    background: 'var(--bg-base)',
                    border: `1px solid var(--border)`,
                    color: def.color,
                    borderRadius: 4,
                    padding: '3px 6px',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Input port (left) — all nodes can receive connections ── */}
      <div
        onMouseDown={(e) => { e.stopPropagation(); e.preventDefault() }}
        onMouseUp={(e) => { e.stopPropagation(); onPortMouseUp(node.id) }}
        title="Drop connection here"
        style={{
          position:  'absolute', left: -10, top: '50%',
          transform: 'translateY(-50%)',
          width: 18, height: 18, borderRadius: '50%',
          background: isTargetable ? def.color : 'var(--bg-elevated)',
          border:     `2px solid ${isTargetable ? def.color : 'var(--border-light)'}`,
          cursor:     isTargetable ? 'crosshair' : 'default',
          transition: 'all 0.15s',
          zIndex:     20,
          boxShadow:  isTargetable ? `0 0 10px ${def.color}` : 'none',
        }}
      />

      {/* ── Output port (right) — all nodes can create connections ── */}
      <div
        onMouseDown={(e) => { e.stopPropagation(); onPortMouseDown(e, node.id) }}
        title="Drag to connect"
        style={{
          position:  'absolute', right: -10, top: '50%',
          transform: 'translateY(-50%)',
          width: 18, height: 18, borderRadius: '50%',
          background: isSource ? def.color : 'var(--bg-elevated)',
          border:     `2px solid ${isSource ? def.color : 'var(--border-light)'}`,
          cursor:     'crosshair',
          transition: 'all 0.15s',
          zIndex:     20,
          boxShadow:  isSource ? `0 0 10px ${def.color}` : 'none',
        }}
      />
    </div>
  )
}
