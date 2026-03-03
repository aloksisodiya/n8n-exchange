import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  workflowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    index: true,
  },
  executionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Execution',
    index: true,
  },
  type: {
    type: String,
    enum: ['buy', 'sell'],
    required: true,
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    index: true,
  },
  coinName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  pricePerUnit: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  fee: {
    type: Number,
    default: 0,
  },
  netAmount: {
    type: Number,
    required: true,
  },
  balanceBefore: {
    type: Number,
    required: true,
  },
  balanceAfter: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed',
    required: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  metadata: {
    triggerType: String,
    nodeId: String,
    priceAtExecution: Number,
    marketCondition: String,
  },
}, {
  timestamps: true,
});

// Indexes
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ symbol: 1, createdAt: -1 });
transactionSchema.index({ workflowId: 1, createdAt: -1 });
transactionSchema.index({ type: 1, createdAt: -1 });
transactionSchema.index({ createdAt: -1 });

// Virtual for profit/loss (only relevant for sell transactions)
transactionSchema.virtual('profitLoss').get(function() {
  if (this.type === 'sell' && this.metadata?.priceAtExecution) {
    return (this.pricePerUnit - this.metadata.priceAtExecution) * this.quantity;
  }
  return 0;
});

// Methods
transactionSchema.methods.toJSON = function() {
  const transaction = this.toObject({ virtuals: true });
  delete transaction.__v;
  return transaction;
};

// Statics
transactionSchema.statics.getUserTransactionStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId, status: 'completed' } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        totalFees: { $sum: '$fee' },
      },
    },
  ]);
  
  return stats.reduce((acc, stat) => {
    acc[stat._id] = {
      count: stat.count,
      totalAmount: stat.totalAmount,
      totalFees: stat.totalFees,
    };
    return acc;
  }, {});
};

transactionSchema.statics.getSymbolTransactionHistory = async function(userId, symbol) {
  return this.find({ userId, symbol, status: 'completed' })
    .sort({ createdAt: -1 })
    .limit(50);
};

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
