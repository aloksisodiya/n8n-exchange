import { NODE_TYPES } from '../../constants/nodeTypes'
import { bezierPath, getPortPos } from '../../utils/helpers'

export default function EdgeLayer({ nodes, edges, connecting, mousePos, isActive }) {
  function getSrcNode(nodeId) {
    return nodes.find(n => n.id === nodeId)
  }

  return (
    <svg
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 3,
      }}
    >
      <defs>
        {/* Arrow markers for all node type colors */}
        {Object.entries(NODE_TYPES).map(([type, def]) => (
          <marker
            key={type}
            id={`arrow-${type}`}
            viewBox="0 0 10 10"
            refX="9" refY="5"
            markerWidth="6" markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={def.color} />
          </marker>
        ))}
        <marker id="arrow-connecting" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
        </marker>
      </defs>

      {/* ── Existing edges ── */}
      {edges.map(edge => {
        const srcNode = getSrcNode(edge.source)
        const tgtNode = getSrcNode(edge.target)
        if (!srcNode || !tgtNode) return null
        const def = NODE_TYPES[srcNode.type]
        if (!def) return null

        const src = getPortPos(srcNode, 'out')
        const tgt = getPortPos(tgtNode, 'in')
        const path = bezierPath(src.x, src.y, tgt.x, tgt.y)

        return (
          <g key={edge.id}>
            {/* Glow layer */}
            <path d={path} stroke={def.color} strokeWidth={6} fill="none" opacity={0.12} />
            {/* Main line */}
            <path
              d={path}
              stroke={def.color}
              strokeWidth={1.8}
              fill="none"
              strokeDasharray={isActive ? '8 4' : '6 5'}
              markerEnd={`url(#arrow-${srcNode.type})`}
              style={isActive ? { animation: 'flow 0.8s linear infinite' } : {}}
            />
          </g>
        )
      })}

      {/* ── In-progress connection line ── */}
      {connecting && (() => {
        const srcNode = getSrcNode(connecting.nodeId)
        if (!srcNode) return null
        const src = getPortPos(srcNode, 'out')
        const path = bezierPath(src.x, src.y, mousePos.x, mousePos.y)
        return (
          <path
            d={path}
            stroke="#f59e0b"
            strokeWidth={1.5}
            fill="none"
            strokeDasharray="7 4"
            markerEnd="url(#arrow-connecting)"
            opacity={0.8}
          />
        )
      })()}
    </svg>
  )
}
