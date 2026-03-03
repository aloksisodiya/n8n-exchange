import mongoose from 'mongoose';

const marketPriceSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  percentChange24h: {
    type: Number,
  },
  percentChange7d: {
    type: Number,
  },
  marketCap: {
    type: Number,
  },
  volume24h: {
    type: Number,
  },
  circulatingSupply: {
    type: Number,
  },
  maxSupply: {
    type: Number,
  },
  cmcRank: {
    type: Number,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true,
  },
  source: {
    type: String,
    default: 'coinmarketcap',
  },
}, {
  timestamps: true,
});

// Indexes
marketPriceSchema.index({ symbol: 1, lastUpdated: -1 });
marketPriceSchema.index({ lastUpdated: -1 });

// Methods
marketPriceSchema.methods.updatePrice = function(priceData) {
  Object.assign(this, priceData);
  this.lastUpdated = new Date();
  return this.save();
};

marketPriceSchema.methods.toJSON = function() {
  const price = this.toObject();
  delete price.__v;
  return price;
};

// Statics
marketPriceSchema.statics.getMultiplePrices = async function(symbols) {
  return this.find({ symbol: { $in: symbols } })
    .select('symbol name price percentChange24h lastUpdated');
};

marketPriceSchema.statics.getAllPrices = async function() {
  return this.find({})
    .select('symbol name price percentChange24h percentChange7d lastUpdated')
    .sort({ cmcRank: 1 });
};

const MarketPrice = mongoose.model('MarketPrice', marketPriceSchema);

export default MarketPrice;
