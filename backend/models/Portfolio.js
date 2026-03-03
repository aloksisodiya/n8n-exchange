import mongoose from 'mongoose';

const holdingSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  averageBuyPrice: {
    type: Number,
    required: true,
  },
  currentPrice: {
    type: Number,
    required: true,
  },
  totalInvested: {
    type: Number,
    required: true,
  },
  currentValue: {
    type: Number,
    required: true,
  },
  profitLoss: {
    type: Number,
    required: true,
  },
  profitLossPercentage: {
    type: Number,
    required: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  holdings: {
    type: [holdingSchema],
    default: [],
  },
  totalValue: {
    type: Number,
    default: 0,
  },
  totalInvested: {
    type: Number,
    default: 0,
  },
  totalProfitLoss: {
    type: Number,
    default: 0,
  },
  totalProfitLossPercentage: {
    type: Number,
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
portfolioSchema.index({ userId: 1 });
portfolioSchema.index({ totalValue: -1 });
portfolioSchema.index({ 'holdings.symbol': 1 });

// Methods
portfolioSchema.methods.addHolding = function(symbol, name, quantity, price) {
  const existingHolding = this.holdings.find(h => h.symbol === symbol);
  
  if (existingHolding) {
    // Update existing holding
    const totalQuantity = existingHolding.quantity + quantity;
    const totalInvested = existingHolding.totalInvested + (quantity * price);
    existingHolding.quantity = totalQuantity;
    existingHolding.averageBuyPrice = totalInvested / totalQuantity;
    existingHolding.totalInvested = totalInvested;
    existingHolding.currentPrice = price;
    existingHolding.currentValue = totalQuantity * price;
    existingHolding.profitLoss = existingHolding.currentValue - totalInvested;
    existingHolding.profitLossPercentage = (existingHolding.profitLoss / totalInvested) * 100;
    existingHolding.lastUpdated = new Date();
  } else {
    // Add new holding
    const totalInvested = quantity * price;
    this.holdings.push({
      symbol,
      name,
      quantity,
      averageBuyPrice: price,
      currentPrice: price,
      totalInvested,
      currentValue: totalInvested,
      profitLoss: 0,
      profitLossPercentage: 0,
      lastUpdated: new Date(),
    });
  }
  
  this.recalculateTotals();
  return this.save();
};

portfolioSchema.methods.removeHolding = function(symbol, quantity, currentPrice) {
  const holding = this.holdings.find(h => h.symbol === symbol);
  
  if (!holding) {
    throw new Error('Holding not found');
  }
  
  if (holding.quantity < quantity) {
    throw new Error('Insufficient quantity');
  }
  
  // Calculate proportional invested amount
  const proportionalInvested = (quantity / holding.quantity) * holding.totalInvested;
  
  holding.quantity -= quantity;
  holding.totalInvested -= proportionalInvested;
  
  if (holding.quantity === 0) {
    // Remove holding completely
    this.holdings = this.holdings.filter(h => h.symbol !== symbol);
  } else {
    // Update holding values
    holding.currentPrice = currentPrice;
    holding.currentValue = holding.quantity * currentPrice;
    holding.profitLoss = holding.currentValue - holding.totalInvested;
    holding.profitLossPercentage = (holding.profitLoss / holding.totalInvested) * 100;
    holding.lastUpdated = new Date();
  }
  
  this.recalculateTotals();
  return this.save();
};

portfolioSchema.methods.updatePrices = function(priceMap) {
  this.holdings.forEach(holding => {
    if (priceMap[holding.symbol]) {
      holding.currentPrice = priceMap[holding.symbol];
      holding.currentValue = holding.quantity * holding.currentPrice;
      holding.profitLoss = holding.currentValue - holding.totalInvested;
      holding.profitLossPercentage = holding.totalInvested > 0 
        ? (holding.profitLoss / holding.totalInvested) * 100 
        : 0;
      holding.lastUpdated = new Date();
    }
  });
  
  this.recalculateTotals();
  return this.save();
};

portfolioSchema.methods.recalculateTotals = function() {
  this.totalValue = this.holdings.reduce((sum, h) => sum + h.currentValue, 0);
  this.totalInvested = this.holdings.reduce((sum, h) => sum + h.totalInvested, 0);
  this.totalProfitLoss = this.totalValue - this.totalInvested;
  this.totalProfitLossPercentage = this.totalInvested > 0
    ? (this.totalProfitLoss / this.totalInvested) * 100
    : 0;
  this.lastUpdated = new Date();
};

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

export default Portfolio;
