import mongoose from 'mongoose';

const pricePointSchema = new mongoose.Schema({
  price: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  volume: {
    type: Number,
  },
}, { _id: false });

const priceHistorySchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    index: true,
  },
  interval: {
    type: String,
    enum: ['1m', '5m', '15m', '1h', '4h', '1d'],
    required: true,
  },
  dataPoints: {
    type: [pricePointSchema],
    default: [],
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Compound index
priceHistorySchema.index({ symbol: 1, interval: 1 }, { unique: true });
priceHistorySchema.index({ lastUpdated: -1 });

// Methods
priceHistorySchema.methods.addDataPoint = function(price, volume = null) {
  this.dataPoints.push({
    price,
    timestamp: new Date(),
    volume,
  });
  
  // Keep only last 1000 data points
  if (this.dataPoints.length > 1000) {
    this.dataPoints = this.dataPoints.slice(-1000);
  }
  
  this.lastUpdated = new Date();
  return this.save();
};

priceHistorySchema.methods.getLatestDataPoints = function(limit = 100) {
  return this.dataPoints.slice(-limit);
};

const PriceHistory = mongoose.model('PriceHistory', priceHistorySchema);

export default PriceHistory;
