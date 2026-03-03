import mongoose from 'mongoose';

const systemConfigSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
    enum: ['trading', 'pricing', 'execution', 'notifications', 'system'],
    default: 'system',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastModifiedBy: {
    type: String,
  },
}, {
  timestamps: true,
});

// Indexes
systemConfigSchema.index({ category: 1 });
systemConfigSchema.index({ isActive: 1 });

// Statics
systemConfigSchema.statics.get = async function(key, defaultValue = null) {
  const config = await this.findOne({ key, isActive: true });
  return config ? config.value : defaultValue;
};

systemConfigSchema.statics.set = async function(key, value, data = {}) {
  return this.findOneAndUpdate(
    { key },
    { value, ...data, updatedAt: new Date() },
    { upsert: true, new: true }
  );
};

systemConfigSchema.statics.getByCategory = async function(category) {
  return this.find({ category, isActive: true });
};

// Default configurations
systemConfigSchema.statics.initializeDefaults = async function() {
  const defaults = [
    {
      key: 'INITIAL_WALLET_BALANCE',
      value: 10000,
      description: 'Initial virtual wallet balance for new users (in USD)',
      category: 'trading',
    },
    {
      key: 'PRICE_POLL_INTERVAL',
      value: 10000,
      description: 'Interval for polling CoinMarketCap prices (in milliseconds)',
      category: 'pricing',
    },
    {
      key: 'SUPPORTED_SYMBOLS',
      value: ['BTC', 'ETH', 'BNB', 'SOL', 'DOGE'],
      description: 'List of supported cryptocurrency symbols',
      category: 'trading',
    },
    {
      key: 'TRANSACTION_FEE_PERCENTAGE',
      value: 0,
      description: 'Transaction fee percentage (0 = no fees for simulation)',
      category: 'trading',
    },
    {
      key: 'MAX_WORKFLOWS_PER_USER',
      value: 50,
      description: 'Maximum number of workflows a user can create',
      category: 'execution',
    },
    {
      key: 'MAX_ACTIVE_WORKFLOWS_PER_USER',
      value: 10,
      description: 'Maximum number of active workflows per user',
      category: 'execution',
    },
    {
      key: 'EXECUTION_TIMEOUT',
      value: 60000,
      description: 'Maximum execution time for a workflow (in milliseconds)',
      category: 'execution',
    },
    {
      key: 'ENABLE_WEBSOCKET',
      value: true,
      description: 'Enable WebSocket for real-time price updates',
      category: 'system',
    },
  ];
  
  for (const config of defaults) {
    await this.findOneAndUpdate(
      { key: config.key },
      config,
      { upsert: true, new: true }
    );
  }
  
  console.log('✅ System configuration initialized with defaults');
};

const SystemConfig = mongoose.model('SystemConfig', systemConfigSchema);

export default SystemConfig;
