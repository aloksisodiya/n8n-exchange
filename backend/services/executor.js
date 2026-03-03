import cron from 'node-cron';
import { Workflow, Execution, Transaction, Portfolio, User, MarketPrice, Log } from '../models/index.js';
import EventEmitter from 'events';

class WorkflowExecutor extends EventEmitter {
  constructor() {
    super();
    this.scheduledJobs = new Map(); // workflowId -> cron job
    this.priceMonitors = new Map(); // workflowId -> interval handle
  }

  // Initialize executor: load all active workflows
  async initialize() {
    try {
      const activeWorkflows = await Workflow.find({ isActive: true });
      console.log(`🔄 Initializing ${activeWorkflows.length} active workflows...`);

      for (const workflow of activeWorkflows) {
        await this.scheduleWorkflow(workflow);
      }

      console.log('✅ Workflow executor initialized');
    } catch (error) {
      console.error('❌ Failed to initialize workflow executor:', error);
      await Log.error('execution', 'Failed to initialize workflow executor', {
        metadata: { error: error.message },
        stack: error.stack,
      });
    }
  }

  // Schedule a workflow based on its trigger nodes
  async scheduleWorkflow(workflow) {
    try {
      const triggerNodes = workflow.getTriggerNodes();

      for (const triggerNode of triggerNodes) {
        if (triggerNode.type === 'timer') {
          await this.scheduleTimerTrigger(workflow, triggerNode);
        } else if (triggerNode.type === 'price-monitor') {
          await this.schedulePriceMonitor(workflow, triggerNode);
        }
      }

      await Log.info('execution', `Workflow scheduled: ${workflow.name}`, {
        workflowId: workflow._id,
        userId: workflow.userId,
      });
    } catch (error) {
      console.error(`❌ Failed to schedule workflow ${workflow._id}:`, error);
      await Log.error('execution', `Failed to schedule workflow: ${workflow.name}`, {
        workflowId: workflow._id,
        userId: workflow.userId,
        metadata: { error: error.message },
      });
    }
  }

  // Schedule a timer-based trigger
  async scheduleTimerTrigger(workflow, triggerNode) {
    const { cronExpression } = triggerNode.data;

    if (!cron.validate(cronExpression)) {
      throw new Error(`Invalid cron expression: ${cronExpression}`);
    }

    const jobKey = `${workflow._id}-${triggerNode.id}`;

    // Remove existing job if any
    if (this.scheduledJobs.has(jobKey)) {
      this.scheduledJobs.get(jobKey).stop();
    }

    // Create new cron job
    const job = cron.schedule(cronExpression, async () => {
      await this.executeWorkflow(workflow._id, {
        triggerType: 'timer',
        triggerNodeId: triggerNode.id,
        cronExpression,
      });
    });

    this.scheduledJobs.set(jobKey, job);

    // Update workflow cron state
    await workflow.updateCronState({
      jobId: jobKey,
      cronExpression,
      isScheduled: true,
      lastRun: null,
      nextRun: this.getNextCronRun(cronExpression),
    });

    console.log(`⏰ Timer scheduled for workflow "${workflow.name}": ${cronExpression}`);
  }

  // Schedule a price monitor trigger
  async schedulePriceMonitor(workflow, triggerNode) {
    const { symbol, condition, targetPrice, pollInterval = 10000 } = triggerNode.data;
    const jobKey = `${workflow._id}-${triggerNode.id}`;

    // Remove existing monitor if any
    if (this.priceMonitors.has(jobKey)) {
      clearInterval(this.priceMonitors.get(jobKey));
    }

    // Create price monitoring interval
    const intervalHandle = setInterval(async () => {
      try {
        const marketPrice = await MarketPrice.findOne({ symbol });
        if (!marketPrice) return;

        const currentPrice = marketPrice.price;
        let conditionMet = false;

        switch (condition) {
          case 'above':
            conditionMet = currentPrice > targetPrice;
            break;
          case 'below':
            conditionMet = currentPrice < targetPrice;
            break;
          case 'equals':
            conditionMet = Math.abs(currentPrice - targetPrice) < 0.01;
            break;
        }

        if (conditionMet) {
          await this.executeWorkflow(workflow._id, {
            triggerType: 'price-monitor',
            triggerNodeId: triggerNode.id,
            symbol,
            currentPrice,
            targetPrice,
            condition,
          });
        }
      } catch (error) {
        console.error(`❌ Price monitor error for workflow ${workflow._id}:`, error);
      }
    }, pollInterval);

    this.priceMonitors.set(jobKey, intervalHandle);
    console.log(`📊 Price monitor scheduled for workflow "${workflow.name}": ${symbol} ${condition} ${targetPrice}`);
  }

  // Unschedule a workflow
  async unscheduleWorkflow(workflowId) {
    try {
      // Stop all timer jobs for this workflow
      for (const [jobKey, job] of this.scheduledJobs.entries()) {
        if (jobKey.startsWith(workflowId)) {
          job.stop();
          this.scheduledJobs.delete(jobKey);
        }
      }

      // Stop all price monitors for this workflow
      for (const [jobKey, intervalHandle] of this.priceMonitors.entries()) {
        if (jobKey.startsWith(workflowId)) {
          clearInterval(intervalHandle);
          this.priceMonitors.delete(jobKey);
        }
      }

      // Update workflow cron state
      const workflow = await Workflow.findById(workflowId);
      if (workflow) {
        await workflow.updateCronState({
          isScheduled: false,
          jobId: null,
        });
      }

      console.log(`🛑 Workflow unscheduled: ${workflowId}`);
    } catch (error) {
      console.error(`❌ Failed to unschedule workflow ${workflowId}:`, error);
    }
  }

  // Execute a workflow
  async executeWorkflow(workflowId, triggerData) {
    let execution = null;

    try {
      const workflow = await Workflow.findById(workflowId);
      if (!workflow || !workflow.isActive) {
        console.warn(`⚠️  Workflow ${workflowId} not found or inactive`);
        return;
      }

      // Create execution record
      execution = new Execution({
        workflowId: workflow._id,
        userId: workflow.userId,
        status: 'pending',
        triggerType: triggerData.triggerType,
        triggerData,
        totalNodes: workflow.nodes.length,
        metadata: {
          triggerNodeId: triggerData.triggerNodeId,
          executionMode: 'automatic',
        },
      });
      await execution.save();
      await execution.start();

      console.log(`🚀 Executing workflow: ${workflow.name} (${workflow._id})`);

      // Execute nodes in topological order
      await this.executeNodes(workflow, execution, triggerData);

      // Mark execution as complete
      await execution.complete(true);
      await workflow.incrementExecutionCount(true);

      await Log.info('execution', `Workflow executed successfully: ${workflow.name}`, {
        workflowId: workflow._id,
        executionId: execution._id,
        userId: workflow.userId,
      });

      this.emit('workflowExecuted', { workflow, execution });
    } catch (error) {
      console.error(`❌ Workflow execution failed (${workflowId}):`, error);

      if (execution) {
        await execution.complete(false, error.message);
      }

      const workflow = await Workflow.findById(workflowId);
      if (workflow) {
        await workflow.incrementExecutionCount(false);
      }

      await Log.error('execution', `Workflow execution failed: ${workflowId}`, {
        workflowId,
        executionId: execution?._id,
        metadata: { error: error.message },
        stack: error.stack,
      });
    }
  }

  // Execute nodes in workflow order
  async executeNodes(workflow, execution, triggerData) {
    const { nodes, edges } = workflow;
    const triggerNodeId = triggerData.triggerNodeId;

    // Build adjacency list for graph traversal
    const adjacencyList = new Map();
    nodes.forEach(node => adjacencyList.set(node.id, []));
    edges.forEach(edge => {
      if (adjacencyList.has(edge.source)) {
        adjacencyList.get(edge.source).push(edge.target);
      }
    });

    // Execute nodes starting from trigger node
    const visited = new Set();
    const queue = [triggerNodeId];

    while (queue.length > 0) {
      const currentNodeId = queue.shift();
      if (visited.has(currentNodeId)) continue;
      visited.add(currentNodeId);

      const node = nodes.find(n => n.id === currentNodeId);
      if (!node) continue;

      // Execute current node
      const nodeResult = await this.executeNode(node, workflow, execution, triggerData);
      await execution.addNodeResult(nodeResult);

      // If node failed and it's critical, stop execution
      if (nodeResult.status === 'failed' && node.type !== 'notify') {
        throw new Error(`Node execution failed: ${node.type} - ${nodeResult.error}`);
      }

      // Add connected nodes to queue
      const connectedNodes = adjacencyList.get(currentNodeId) || [];
      queue.push(...connectedNodes);
    }
  }

  // Execute a single node
  async executeNode(node, workflow, execution, triggerData) {
    const startTime = Date.now();
    const result = {
      nodeId: node.id,
      nodeType: node.type,
      status: 'running',
      input: node.data,
      executedAt: new Date(),
    };

    try {
      switch (node.type) {
        case 'timer':
        case 'price-monitor':
          result.output = { triggered: true, ...triggerData };
          result.status = 'success';
          break;

        case 'condition':
          result.output = await this.executeConditionNode(node, triggerData);
          result.status = 'success';
          break;

        case 'buy':
          result.output = await this.executeBuyNode(node, workflow, execution);
          result.status = 'success';
          break;

        case 'sell':
          result.output = await this.executeSellNode(node, workflow, execution);
          result.status = 'success';
          break;

        case 'notify':
          result.output = await this.executeNotifyNode(node);
          result.status = 'success';
          break;

        default:
          result.status = 'skipped';
          result.output = { message: 'Unknown node type' };
      }
    } catch (error) {
      result.status = 'failed';
      result.error = error.message;
      console.error(`❌ Node execution failed (${node.type}):`, error);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  // Execute condition node
  async executeConditionNode(node, triggerData) {
    const { operator, leftValue, rightValue } = node.data;
    
    // Simple evaluation (can be enhanced with expression parser)
    let left = leftValue;
    let right = rightValue;

    // Replace {{currentPrice}} with actual value
    if (triggerData.currentPrice) {
      left = left.toString().replace('{{currentPrice}}', triggerData.currentPrice);
      right = right.toString().replace('{{currentPrice}}', triggerData.currentPrice);
    }

    const leftNum = parseFloat(left);
    const rightNum = parseFloat(right);

    let result = false;
    switch (operator) {
      case '>': result = leftNum > rightNum; break;
      case '<': result = leftNum < rightNum; break;
      case '>=': result = leftNum >= rightNum; break;
      case '<=': result = leftNum <= rightNum; break;
      case '==': result = leftNum === rightNum; break;
      case '!=': result = leftNum !== rightNum; break;
    }

    return { conditionMet: result, leftValue: leftNum, rightValue: rightNum, operator };
  }

  // Execute buy node
  async executeBuyNode(node, workflow, execution) {
    const { symbol, amountType, amount, useCurrentPrice, limitPrice } = node.data;

    // Get current market price
    const marketPrice = await MarketPrice.findOne({ symbol });
    if (!marketPrice) {
      throw new Error(`Market price not found for ${symbol}`);
    }

    const pricePerUnit = useCurrentPrice ? marketPrice.price : limitPrice;

    // Get user and portfolio
    const user = await User.findOne({ uid: workflow.userId });
    if (!user) throw new Error('User not found');

    let portfolio = await Portfolio.findOne({ userId: workflow.userId });
    if (!portfolio) {
      portfolio = new Portfolio({ userId: workflow.userId });
      await portfolio.save();
    }

    // Calculate quantity based on amount type
    let quantity = 0;
    let totalAmount = 0;

    switch (amountType) {
      case 'usd':
        totalAmount = amount;
        quantity = totalAmount / pricePerUnit;
        break;
      case 'quantity':
        quantity = amount;
        totalAmount = quantity * pricePerUnit;
        break;
      case 'percentage':
        totalAmount = (user.wallet.balance * amount) / 100;
        quantity = totalAmount / pricePerUnit;
        break;
    }

    // Check if user has sufficient balance
    if (user.wallet.balance < totalAmount) {
      throw new Error('Insufficient balance');
    }

    // Create transaction
    const transaction = new Transaction({
      userId: workflow.userId,
      workflowId: workflow._id,
      executionId: execution._id,
      type: 'buy',
      symbol,
      coinName: marketPrice.name,
      quantity,
      pricePerUnit,
      totalAmount,
      fee: 0,
      netAmount: totalAmount,
      balanceBefore: user.wallet.balance,
      balanceAfter: user.wallet.balance - totalAmount,
      status: 'completed',
      metadata: {
        triggerType: execution.triggerType,
        nodeId: node.id,
        priceAtExecution: pricePerUnit,
      },
    });
    await transaction.save();

    // Update user balance
    await user.updateBalance(-totalAmount);

    // Update portfolio
    await portfolio.addHolding(symbol, marketPrice.name, quantity, pricePerUnit);

    console.log(`💰 BUY executed: ${quantity.toFixed(8)} ${symbol} @ $${pricePerUnit.toFixed(2)}`);

    return {
      action: 'buy',
      symbol,
      quantity,
      pricePerUnit,
      totalAmount,
      transactionId: transaction._id,
    };
  }

  // Execute sell node
  async executeSellNode(node, workflow, execution) {
    const { symbol, amountType, amount, useCurrentPrice, limitPrice } = node.data;

    // Get current market price
    const marketPrice = await MarketPrice.findOne({ symbol });
    if (!marketPrice) {
      throw new Error(`Market price not found for ${symbol}`);
    }

    const pricePerUnit = useCurrentPrice ? marketPrice.price : limitPrice;

    // Get user and portfolio
    const user = await User.findOne({ uid: workflow.userId });
    if (!user) throw new Error('User not found');

    const portfolio = await Portfolio.findOne({ userId: workflow.userId });
    if (!portfolio) throw new Error('Portfolio not found');

    const holding = portfolio.holdings.find(h => h.symbol === symbol);
    if (!holding) throw new Error(`No holdings found for ${symbol}`);

    // Calculate quantity based on amount type
    let quantity = 0;

    switch (amountType) {
      case 'quantity':
        quantity = amount;
        break;
      case 'percentage':
        quantity = (holding.quantity * amount) / 100;
        break;
      case 'all':
        quantity = holding.quantity;
        break;
    }

    if (quantity > holding.quantity) {
      throw new Error('Insufficient holdings');
    }

    const totalAmount = quantity * pricePerUnit;

    // Create transaction
    const transaction = new Transaction({
      userId: workflow.userId,
      workflowId: workflow._id,
      executionId: execution._id,
      type: 'sell',
      symbol,
      coinName: marketPrice.name,
      quantity,
      pricePerUnit,
      totalAmount,
      fee: 0,
      netAmount: totalAmount,
      balanceBefore: user.wallet.balance,
      balanceAfter: user.wallet.balance + totalAmount,
      status: 'completed',
      metadata: {
        triggerType: execution.triggerType,
        nodeId: node.id,
        priceAtExecution: pricePerUnit,
      },
    });
    await transaction.save();

    // Update user balance
    await user.updateBalance(totalAmount);

    // Update portfolio
    await portfolio.removeHolding(symbol, quantity, pricePerUnit);

    console.log(`💸 SELL executed: ${quantity.toFixed(8)} ${symbol} @ $${pricePerUnit.toFixed(2)}`);

    return {
      action: 'sell',
      symbol,
      quantity,
      pricePerUnit,
      totalAmount,
      transactionId: transaction._id,
    };
  }

  // Execute notify node
  async executeNotifyNode(node) {
    const { message, type } = node.data;
    
    // In production, this would send actual notifications
    // For now, just log it
    console.log(`🔔 NOTIFICATION [${type}]: ${message}`);

    return { notified: true, message, type };
  }

  // Get next cron run time (simplified)
  getNextCronRun(cronExpression) {
    // In production, use a proper cron parser library
    // For now, just return a future date
    return new Date(Date.now() + 60000); // 1 minute from now
  }

  // Shutdown executor gracefully
  async shutdown() {
    console.log('🛑 Shutting down workflow executor...');

    // Stop all cron jobs
    for (const [jobKey, job] of this.scheduledJobs.entries()) {
      job.stop();
      console.log(`  Stopped job: ${jobKey}`);
    }

    // Clear all price monitors
    for (const [jobKey, intervalHandle] of this.priceMonitors.entries()) {
      clearInterval(intervalHandle);
      console.log(`  Stopped monitor: ${jobKey}`);
    }

    this.scheduledJobs.clear();
    this.priceMonitors.clear();

    console.log('✅ Workflow executor shut down');
  }
}

// Singleton instance
const workflowExecutor = new WorkflowExecutor();

export default workflowExecutor;
