// ─── ID generation ────────────────────────────────────────────────────────────
export function genId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

// ─── Timestamp ────────────────────────────────────────────────────────────────
export function timestamp() {
  return new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// ─── Date format for display ──────────────────────────────────────────────────
export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('en-US', {
    day:    '2-digit',
    month:  'short',
    hour:   '2-digit',
    minute: '2-digit',
  })
}

// ─── Bezier path for SVG edges ────────────────────────────────────────────────
export function bezierPath(x1, y1, x2, y2) {
  const cx = (x1 + x2) / 2
  return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`
}

// ─── Clamp value within range ─────────────────────────────────────────────────
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max)
}

// ─── Get port position for a node ────────────────────────────────────────────
// kind: 'out' = right side (trigger), 'in' = left side (action)
export function getPortPos(node, kind, nodeWidth = 220, nodeHeight = 145) {
  if (!node) return { x: 0, y: 0 }
  if (kind === 'out') return { x: node.x + nodeWidth + 9, y: node.y + nodeHeight / 2 }
  return { x: node.x - 3, y: node.y + nodeHeight / 2 }
}

// ─── Mock price data ──────────────────────────────────────────────────────────
export const MOCK_PRICES = {
  SOL:  149.82,
  BTC:  61340.50,
  ETH:  3210.75,
  BNB:  390.22,
  DOGE: 0.1423,
}

export const PRICE_CHANGES = {
  SOL:  -2.1,
  BTC:  +1.3,
  ETH:  -0.8,
  BNB:  +0.5,
  DOGE: +4.2,
}
