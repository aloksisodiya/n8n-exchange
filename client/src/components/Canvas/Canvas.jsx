import { useRef, useState, useCallback } from 'react'
import { NODE_TYPES } from '../../constants/nodeTypes'
import { genId as generateId } from '../../utils/helpers'
import NodeCard from './NodeCard'
import EdgeLayer from './EdgeLayer'

export default function Canvas({ nodes, setNodes, edges, setEdges, addLog, isActive }) {
  const canvasRef      = useRef(null)
  const [selected, setSelected]       = useState(null)
  const [dragging, setDragging]       = useState(null)   // { nodeId, ox, oy }
  const [connecting, setConnecting]   = useState(null)   // { nodeId }
  const [mousePos, setMousePos]       = useState({ x: 0, y: 0 })

  // ── Get canvas-relative coords ─────────────────────────────────────────────
  function canvasCoords(e) {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  // ── Drop from sidebar ──────────────────────────────────────────────────────
  function handleDrop(e) {
    e.preventDefault()
    const type = e.dataTransfer.getData('nodeType')
    if (!type || !NODE_TYPES[type]) return
    const { x, y } = canvasCoords(e)
    const def = NODE_TYPES[type]

    const newNode = {
      id:     generateId('node'),
      type,
      x:      Math.max(20, x - 110),
      y:      Math.max(20, y - 55),
      config: Object.fromEntries(
        def.fields.map(f => [f.key, f.default])
      ),
    }
    setNodes(prev => [...prev, newNode])
    addLog(`Node created → [${def.label}] (${def.kind.toUpperCase()}) at (${Math.round(x)}, ${Math.round(y)})`, 'success')
  }

  // ── Node mouse down (start drag) ───────────────────────────────────────────
  function handleNodeMouseDown(e, nodeId) {
    if (e.button !== 0) return
    e.stopPropagation()
    setSelected(nodeId)
    const node = nodes.find(n => n.id === nodeId)
    const { x, y } = canvasCoords(e)
    setDragging({ nodeId, ox: x - node.x, oy: y - node.y })
  }

  // ── Port mouse down (start connection) ────────────────────────────────────
  function handlePortMouseDown(e, nodeId) {
    e.preventDefault()
    const node = nodes.find(n => n.id === nodeId)
    setConnecting({ nodeId })
    const { x, y } = canvasCoords(e)
    setMousePos({ x, y })
    addLog(`Connecting from [${NODE_TYPES[node.type].label}] — drag to an Action node's input port`, 'warn')
  }

  // ── Port mouse up (complete connection) ────────────────────────────────────
  function handlePortMouseUp(targetId) {
    if (!connecting) return
    if (connecting.nodeId === targetId) { setConnecting(null); return }

    const srcDef = NODE_TYPES[nodes.find(n => n.id === connecting.nodeId)?.type]
    const tgtDef = NODE_TYPES[nodes.find(n => n.id === targetId)?.type]

    // Prevent action → action connections
    if (tgtDef?.kind !== 'action') {
      addLog('Invalid connection — can only connect Trigger → Action.', 'error')
      setConnecting(null); return
    }
    // Prevent duplicates
    if (edges.find(e => e.source === connecting.nodeId && e.target === targetId)) {
      addLog('Connection already exists between these nodes.', 'warn')
      setConnecting(null); return
    }

    const srcNode = nodes.find(n => n.id === connecting.nodeId)
    const tgtNode = nodes.find(n => n.id === targetId)
    const newEdge = { id: generateId('edge'), source: connecting.nodeId, target: targetId }
    setEdges(prev => [...prev, newEdge])
    addLog(`Connected → [${NODE_TYPES[srcNode.type].label}] ──► [${NODE_TYPES[tgtNode.type].label}]`, 'success')
    setConnecting(null)
  }

  // ── Canvas mouse move ──────────────────────────────────────────────────────
  function handleMouseMove(e) {
    const coords = canvasCoords(e)
    setMousePos(coords)
    if (dragging) {
      setNodes(prev => prev.map(n =>
        n.id === dragging.nodeId
          ? { ...n, x: coords.x - dragging.ox, y: coords.y - dragging.oy }
          : n
      ))
    }
  }

  // ── Canvas mouse up ────────────────────────────────────────────────────────
  function handleMouseUp(e) {
    if (dragging) {
      const node = nodes.find(n => n.id === dragging.nodeId)
      if (node) addLog(`Node [${NODE_TYPES[node.type].label}] repositioned to (${Math.round(node.x)}, ${Math.round(node.y)})`, 'info')
      setDragging(null)
    }
    if (connecting) {
      addLog('Connection cancelled — drop on an Action node\'s input port (left ●).', 'warn')
      setConnecting(null)
    }
  }

  // ── Delete selected node ───────────────────────────────────────────────────
  function handleKeyDown(e) {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selected) {
      const node = nodes.find(n => n.id === selected)
      if (!node) return
      setNodes(prev => prev.filter(n => n.id !== selected))
      setEdges(prev => prev.filter(e => e.source !== selected && e.target !== selected))
      addLog(`Node [${NODE_TYPES[node.type].label}] deleted.`, 'error')
      setSelected(null)
    }
  }

  // ── Config change for a node ───────────────────────────────────────────────
  function handleConfigChange(nodeId, key, value) {
    const node = nodes.find(n => n.id === nodeId)
    setNodes(prev => prev.map(n =>
      n.id === nodeId ? { ...n, config: { ...n.config, [key]: value } } : n
    ))
    addLog(`[${NODE_TYPES[node.type].label}] config updated — ${key}: ${value}`, 'info')
  }

  return (
    <div
      ref={canvasRef}
      tabIndex={0}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
      onKeyDown={handleKeyDown}
      onClick={() => setSelected(null)}
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        cursor: connecting ? 'crosshair' : dragging ? 'grabbing' : 'default',
        backgroundImage: 'radial-gradient(circle, #1e2433 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        outline: 'none',
      }}
    >
      {/* Empty state */}
      {nodes.length === 0 && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
          gap: 12,
        }}>
          <div style={{ fontSize: 52, opacity: 0.06 }}>⚡</div>
          <div style={{ color: '#1e2433', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)' }}>
            DRAG NODES FROM THE LEFT PANEL
          </div>
          <div style={{ color: '#161b27', fontSize: 11 }}>
            Start with a Trigger, then connect an Action
          </div>
        </div>
      )}

      {/* SVG edge layer */}
      <EdgeLayer
        nodes={nodes}
        edges={edges}
        connecting={connecting}
        mousePos={mousePos}
        isActive={isActive}
      />

      {/* Node cards */}
      {nodes.map(node => (
        <NodeCard
          key={node.id}
          node={node}
          selected={selected === node.id}
          onMouseDown={handleNodeMouseDown}
          onPortMouseDown={handlePortMouseDown}
          onPortMouseUp={handlePortMouseUp}
          isConnecting={connecting}
          onConfigChange={handleConfigChange}
        />
      ))}

      {/* Active badge */}
      {isActive && (
        <div style={{
          position: 'absolute', top: 16, left: 16,
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#14532d',
          border: '1px solid var(--accent-green)',
          borderRadius: 20,
          padding: '6px 16px',
          zIndex: 50,
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--accent-green)',
            boxShadow: '0 0 8px var(--accent-green)',
            animation: 'pulse-dot 1.5s ease-in-out infinite',
          }} />
          <span style={{ color: 'var(--accent-green)', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
            WORKFLOW ACTIVE
          </span>
        </div>
      )}

      {/* Delete hint */}
      {selected && (
        <div style={{
          position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '5px 14px',
          color: 'var(--text-faint)',
          fontSize: 10,
          zIndex: 50,
        }}>
          Press <kbd style={{ color: 'var(--accent-red)', background: 'var(--bg-base)', padding: '1px 5px', borderRadius: 3, border: '1px solid #7f1d1d' }}>Delete</kbd> to remove selected node
        </div>
      )}
    </div>
  )
}
