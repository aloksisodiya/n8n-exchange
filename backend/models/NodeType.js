import mongoose from 'mongoose';

const nodeTypeSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  category: {
    type: String,
    enum: ['trigger', 'action', 'logic'],
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
  },
  color: {
    type: String,
  },
  configSchema: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  defaultConfig: {
    type: mongoose.Schema.Types.Mixed,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  version: {
    type: String,
    default: '1.0.0',
  },
}, {
  timestamps: true,
});

// Indexes
nodeTypeSchema.index({ category: 1 });
nodeTypeSchema.index({ isActive: 1 });

// Statics
nodeTypeSchema.statics.initializeDefaults = async function() {
  const nodeTypes = [
    {
      type: 'timer',
      category: 'trigger',
      label: 'Timer',
      description: 'Trigger workflow on a schedule using cron expressions',
      icon: '⏰',
      color: '#3b82f6',
      configSchema: {
        cronExpression: { type: 'string', required: true, label: 'Cron Expression' },
        timezone: { type: 'string', default: 'UTC', label: 'Timezone' },
      },
      defaultConfig: {
        cronExpression: '*/5 * * * *',
        timezone: 'UTC',
      },
    },
    {
      type: 'price-monitor',
      category: 'trigger',
      label: 'Price Monitor',
      description: 'Trigger when cryptocurrency price meets condition',
      icon: '📊',
      color: '#8b5cf6',
      configSchema: {
        symbol: { type: 'string', required: true, label: 'Symbol' },
        condition: { type: 'string', enum: ['above', 'below', 'equals'], required: true, label: 'Condition' },
        targetPrice: { type: 'number', required: true, label: 'Target Price' },
        pollInterval: { type: 'number', default: 10000, label: 'Poll Interval (ms)' },
      },
      defaultConfig: {
        symbol: 'BTC',
        condition: 'above',
        targetPrice: 50000,
        pollInterval: 10000,
      },
    },
    {
      type: 'condition',
      category: 'logic',
      label: 'Condition',
      description: 'Evaluate conditions and route workflow accordingly',
      icon: '🔀',
      color: '#f59e0b',
      configSchema: {
        operator: { type: 'string', enum: ['>', '<', '>=', '<=', '==', '!='], required: true, label: 'Operator' },
        leftValue: { type: 'string', required: true, label: 'Left Value' },
        rightValue: { type: 'string', required: true, label: 'Right Value' },
      },
      defaultConfig: {
        operator: '>',
        leftValue: '',
        rightValue: '',
      },
    },
    {
      type: 'buy',
      category: 'action',
      label: 'Buy',
      description: 'Execute a buy order for cryptocurrency',
      icon: '💰',
      color: '#10b981',
      configSchema: {
        symbol: { type: 'string', required: true, label: 'Symbol' },
        amountType: { type: 'string', enum: ['usd', 'quantity', 'percentage'], required: true, label: 'Amount Type' },
        amount: { type: 'number', required: true, label: 'Amount' },
        useCurrentPrice: { type: 'boolean', default: true, label: 'Use Current Price' },
        limitPrice: { type: 'number', label: 'Limit Price' },
      },
      defaultConfig: {
        symbol: 'BTC',
        amountType: 'usd',
        amount: 100,
        useCurrentPrice: true,
      },
    },
    {
      type: 'sell',
      category: 'action',
      label: 'Sell',
      description: 'Execute a sell order for cryptocurrency',
      icon: '💸',
      color: '#ef4444',
      configSchema: {
        symbol: { type: 'string', required: true, label: 'Symbol' },
        amountType: { type: 'string', enum: ['quantity', 'percentage', 'all'], required: true, label: 'Amount Type' },
        amount: { type: 'number', label: 'Amount' },
        useCurrentPrice: { type: 'boolean', default: true, label: 'Use Current Price' },
        limitPrice: { type: 'number', label: 'Limit Price' },
      },
      defaultConfig: {
        symbol: 'BTC',
        amountType: 'percentage',
        amount: 50,
        useCurrentPrice: true,
      },
    },
    {
      type: 'notify',
      category: 'action',
      label: 'Notify',
      description: 'Send a notification message',
      icon: '🔔',
      color: '#6366f1',
      configSchema: {
        message: { type: 'string', required: true, label: 'Message' },
        type: { type: 'string', enum: ['info', 'success', 'warning', 'error'], default: 'info', label: 'Type' },
      },
      defaultConfig: {
        message: 'Workflow executed',
        type: 'info',
      },
    },
  ];
  
  for (const nodeType of nodeTypes) {
    await this.findOneAndUpdate(
      { type: nodeType.type },
      nodeType,
      { upsert: true, new: true }
    );
  }
  
  console.log('✅ Node types initialized with defaults');
};

const NodeType = mongoose.model('NodeType', nodeTypeSchema);

export default NodeType;
