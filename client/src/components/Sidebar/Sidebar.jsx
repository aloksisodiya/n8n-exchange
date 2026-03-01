import { useState } from 'react'
import { TRIGGER_NODES, ACTION_NODES } from '../../constants/nodeTypes'

function NodePill({ type, def }) {
  function handleDragStart(e) {
    e.dataTransfer.setData('nodeType', type)
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      title={def.desc}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 12px',
        margin: '2px 8px',
        borderRadius: 'var(--radius-sm)',
        borderLeft: `3px solid ${def.color}`,
        background: 'var(--bg-elevated)',
        cursor: 'grab',
        transition: 'background 0.12s',
        userSelect: 'none',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = `${def.color}18` }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)' }}
    >
      <span style={{ fontSize: 15, flexShrink: 0 }}>{def.icon}</span>
      <div>
        <div style={{ color: 'var(--text-primary)', fontSize: 11, fontWeight: 600 }}>{def.label}</div>
        <div style={{ color: 'var(--text-faint)', fontSize: 9, marginTop: 1 }}>{def.desc}</div>
      </div>
    </div>
  )
}

function SectionLabel({ label }) {
  return (
    <div style={{
      color: 'var(--text-faint)',
      fontSize: 9, letterSpacing: 2,
      padding: '12px 14px 4px',
      textTransform: 'uppercase',
      fontWeight: 700,
    }}>
      {label}
    </div>
  )
}

export default function Sidebar() {
  return (
    <aside style={{
      width: 210,
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid var(--border)',
        color: 'var(--text-muted)',
        fontSize: 10, letterSpacing: 1,
      }}>
        NODES PALETTE
      </div>

      {/* Triggers */}
      <SectionLabel label="⚡ Triggers" />
      {TRIGGER_NODES.map(([type, def]) => (
        <NodePill key={type} type={type} def={def} />
      ))}

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border)', margin: '10px 0' }} />

      {/* Actions */}
      <SectionLabel label="🎯 Actions" />
      {ACTION_NODES.map(([type, def]) => (
        <NodePill key={type} type={type} def={def} />
      ))}

      {/* Help box */}
      <div style={{
        margin: '14px 10px',
        padding: 12,
        background: 'var(--bg-base)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)',
        marginTop: 'auto',
      }}>
        <div style={{ color: 'var(--accent-yellow)', fontSize: 10, fontWeight: 700, marginBottom: 8 }}>HOW TO USE</div>
        {[
          '1. Drag a Trigger onto the canvas',
          '2. Drag an Action onto the canvas',
          '3. Click ● on Trigger (right)',
          '4. Drop on Action ● (left)',
          '5. Hit ACTIVATE to run',
        ].map((tip, i) => (
          <div key={i} style={{ color: 'var(--text-faint)', fontSize: 9, lineHeight: 1.8 }}>{tip}</div>
        ))}
      </div>
    </aside>
  )
}
