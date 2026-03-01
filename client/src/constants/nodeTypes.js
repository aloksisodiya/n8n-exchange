// ─── All node types used across the app ──────────────────────────────────────
// Adding a new node = just add an entry here. Everything else reads from this.

export const NODE_TYPES = {
  // ── TRIGGERS ──────────────────────────────────────────────────────────────
  timer: {
    label:  'Timer',
    kind:   'trigger',
    color:  '#f59e0b',
    icon:   '⏱',
    desc:   'Run every X seconds / minutes',
    fields: [
      { key: 'interval', label: 'Interval',   type: 'number', placeholder: '10',       default: '10'    },
      { key: 'unit',     label: 'Unit',        type: 'select', options: ['seconds', 'minutes', 'hours'], default: 'seconds' },
    ],
  },
  priceBelow: {
    label:  'Price Below',
    kind:   'trigger',
    color:  '#ef4444',
    icon:   '📉',
    desc:   'When asset price drops below X',
    fields: [
      { key: 'asset',     label: 'Asset',     type: 'select', options: ['SOL', 'BTC', 'ETH', 'BNB', 'DOGE'], default: 'SOL' },
      { key: 'threshold', label: 'Price ($)', type: 'number', placeholder: '150',  default: '150' },
    ],
  },
  priceAbove: {
    label:  'Price Above',
    kind:   'trigger',
    color:  '#22c55e',
    icon:   '📈',
    desc:   'When asset price rises above X',
    fields: [
      { key: 'asset',     label: 'Asset',     type: 'select', options: ['SOL', 'BTC', 'ETH', 'BNB', 'DOGE'], default: 'SOL' },
      { key: 'threshold', label: 'Price ($)', type: 'number', placeholder: '200',  default: '200' },
    ],
  },
  stopLoss: {
    label:  'Stop Loss',
    kind:   'trigger',
    color:  '#f97316',
    icon:   '🛑',
    desc:   'Sell when price drops to loss limit',
    fields: [
      { key: 'asset',   label: 'Asset',       type: 'select', options: ['SOL', 'BTC', 'ETH', 'BNB', 'DOGE'], default: 'SOL' },
      { key: 'stopAt',  label: 'Stop Price ($)', type: 'number', placeholder: '90', default: '90' },
    ],
  },
  takeProfit: {
    label:  'Take Profit',
    kind:   'trigger',
    color:  '#06b6d4',
    icon:   '🎯',
    desc:   'Sell when price hits profit target',
    fields: [
      { key: 'asset',    label: 'Asset',         type: 'select', options: ['SOL', 'BTC', 'ETH', 'BNB', 'DOGE'], default: 'SOL' },
      { key: 'targetAt', label: 'Target Price ($)', type: 'number', placeholder: '130', default: '130' },
    ],
  },
  trailingStop: {
    label:  'Trailing Stop',
    kind:   'trigger',
    color:  '#e879f9',
    icon:   '〰',
    desc:   'Stop moves up as price rises',
    fields: [
      { key: 'asset',      label: 'Asset',            type: 'select', options: ['SOL', 'BTC', 'ETH', 'BNB', 'DOGE'], default: 'SOL' },
      { key: 'trailPct',   label: 'Trail % below peak', type: 'number', placeholder: '10', default: '10' },
    ],
  },

  // ── ACTIONS ───────────────────────────────────────────────────────────────
  longOrder: {
    label:  'Long',
    kind:   'action',
    color:  '#22c55e',
    icon:   '⬆',
    desc:   'Leveraged buy (bet price goes up)',
    fields: [
      { key: 'asset',    label: 'Asset',    type: 'select', options: ['SOL', 'BTC', 'ETH', 'BNB', 'DOGE'], default: 'SOL' },
      { key: 'qty',      label: 'Quantity', type: 'number', placeholder: '0.01',  default: '0.01' },
      { key: 'leverage', label: 'Leverage', type: 'select', options: ['1x','2x','5x','10x','20x'], default: '10x' },
    ],
  },
  shortOrder: {
    label:  'Short',
    kind:   'action',
    color:  '#f43f5e',
    icon:   '⬇',
    desc:   'Leveraged sell (bet price goes down)',
    fields: [
      { key: 'asset',    label: 'Asset',    type: 'select', options: ['SOL', 'BTC', 'ETH', 'BNB', 'DOGE'], default: 'SOL' },
      { key: 'qty',      label: 'Quantity', type: 'number', placeholder: '0.01',  default: '0.01' },
      { key: 'leverage', label: 'Leverage', type: 'select', options: ['1x','2x','5x','10x','20x'], default: '2x' },
    ],
  },
  spotBuy: {
    label:  'Spot Buy',
    kind:   'action',
    color:  '#a3e635',
    icon:   '🛒',
    desc:   'Buy asset at current market price',
    fields: [
      { key: 'asset', label: 'Asset',    type: 'select', options: ['SOL', 'BTC', 'ETH', 'BNB', 'DOGE'], default: 'SOL' },
      { key: 'qty',   label: 'Quantity', type: 'number', placeholder: '0.01', default: '0.01' },
    ],
  },
  spotSell: {
    label:  'Spot Sell',
    kind:   'action',
    color:  '#fb923c',
    icon:   '💸',
    desc:   'Sell asset at current market price',
    fields: [
      { key: 'asset', label: 'Asset',    type: 'select', options: ['SOL', 'BTC', 'ETH', 'BNB', 'DOGE'], default: 'SOL' },
      { key: 'qty',   label: 'Quantity', type: 'number', placeholder: '0.01', default: '0.01' },
    ],
  },
  sendEmail: {
    label:  'Send Email',
    kind:   'action',
    color:  '#818cf8',
    icon:   '✉',
    desc:   'Email notification on trade',
    fields: [
      { key: 'to',      label: 'To',      type: 'text', placeholder: 'user@email.com', default: '' },
      { key: 'subject', label: 'Subject', type: 'text', placeholder: 'Trade executed!', default: 'Trade Alert' },
    ],
  },
  telegram: {
    label:  'Telegram',
    kind:   'action',
    color:  '#38bdf8',
    icon:   '📨',
    desc:   'Telegram notification on trade',
    fields: [
      { key: 'chatId', label: 'Chat ID',   type: 'text', placeholder: '@yourchannel', default: '' },
      { key: 'msg',    label: 'Message',   type: 'text', placeholder: 'Trade fired!', default: 'Trade executed!' },
    ],
  },
}

export const TRIGGER_NODES = Object.entries(NODE_TYPES).filter(([, v]) => v.kind === 'trigger')
export const ACTION_NODES  = Object.entries(NODE_TYPES).filter(([, v]) => v.kind === 'action')

// Default field values for a node type
export function getDefaultConfig(type) {
  const def = NODE_TYPES[type]
  if (!def) return {}
  return def.fields.reduce((acc, f) => ({ ...acc, [f.key]: f.default }), {})
}
