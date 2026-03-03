import mongoose from 'mongoose';

const executionNodeResultSchema = new mongoose.Schema({
  nodeId: {
    type: String,
    required: true,
  },
  nodeType: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'success', 'failed', 'skipped'],
    required: true,
  },
  input: {
    type: mongoose.Schema.Types.Mixed,
  },
  output: {
    type: mongoose.Schema.Types.Mixed,
  },
  error: {
    type: String,
  },
  executedAt: {
    type: Date,
    default: Date.now,
  },
  duration: {
    type: Number, // in milliseconds
  },
}, { _id: false });

const executionSchema = new mongoose.Schema({
  workflowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'success', 'failed', 'cancelled'],
    default: 'pending',
    required: true,
  },
  triggerType: {
    type: String,
    enum: ['timer', 'price-monitor', 'manual'],
    required: true,
  },
  triggerData: {
    type: mongoose.Schema.Types.Mixed,
  },
  nodeResults: {
    type: [executionNodeResultSchema],
    default: [],
  },
  totalNodes: {
    type: Number,
    default: 0,
  },
  executedNodes: {
    type: Number,
    default: 0,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  duration: {
    type: Number, // in milliseconds
  },
  error: {
    type: String,
  },
  metadata: {
    serverVersion: String,
    triggerNodeId: String,
    executionMode: {
      type: String,
      enum: ['automatic', 'manual'],
      default: 'automatic',
    },
  },
}, {
  timestamps: true,
});

// Indexes
executionSchema.index({ workflowId: 1, createdAt: -1 });
executionSchema.index({ userId: 1, createdAt: -1 });
executionSchema.index({ status: 1 });
executionSchema.index({ startedAt: -1 });

// Methods
executionSchema.methods.start = function() {
  this.status = 'running';
  this.startedAt = new Date();
  return this.save();
};

executionSchema.methods.complete = function(success = true, error = null) {
  this.status = success ? 'success' : 'failed';
  this.completedAt = new Date();
  this.duration = this.completedAt - this.startedAt;
  if (error) {
    this.error = error;
  }
  return this.save();
};

executionSchema.methods.addNodeResult = function(result) {
  this.nodeResults.push(result);
  this.executedNodes = this.nodeResults.length;
  return this.save();
};

executionSchema.methods.cancel = function() {
  this.status = 'cancelled';
  this.completedAt = new Date();
  this.duration = this.completedAt - this.startedAt;
  return this.save();
};

executionSchema.methods.toJSON = function() {
  const execution = this.toObject();
  delete execution.__v;
  return execution;
};

const Execution = mongoose.model('Execution', executionSchema);

export default Execution;
