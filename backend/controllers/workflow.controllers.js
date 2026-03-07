/**
 * WORKFLOW CONTROLLERS - TO BE IMPLEMENTED
 * =========================================
 *
 * Required imports:
 * - Workflow, Execution, Log models from '../models/index.js'
 * - workflowExecutor from '../services/executor.js'
 *
 * All functions receive (req, res):
 * - req.user contains { uid, email } from authMiddleware
 * - req.params contains route parameters
 * - req.body contains request payload
 * - req.query contains query parameters
 */

/**
 * 1. GET /api/workflows
 * getAllWorkflows(req, res)
 *
 * Purpose: Get all workflows for the authenticated user
 * Access: req.user.uid
 * Query params:
 *   - isActive (optional): filter by active status
 * Response: Array of workflows sorted by updatedAt desc
 */

import { Workflow } from "../models/index.js";

export const getAllWorkflows = async (req, res) => {
  try {
    const userId = req.user.uid;

    const filter = { userId };

    const {isActive} = req.query;

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const workflows = await Workflow.find(filter).toSorted({ updatedAt: -1 }).lean();

    res.status(200).json({
      success: true,
      data: workflows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * 2. GET /api/workflows/:id
 * getWorkflowById(req, res)
 *
 * Purpose: Get a single workflow by ID
 * Access: req.params.id, req.user.uid
 * Validation: Check workflow belongs to user
 * Response: Single workflow object
 */
export const getWorkflowById = async (req, res) => {
  try {
    const workflowId = req.params.id;
    const userId = req.user.uid;

    const workflow = await Workflow.findOne({
      _id: workflowId,
      userId: userId,
    }).lean();

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: "Workflow not found",
      });
    }

    res.status(200).json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * 3. POST /api/workflows
 * createWorkflow(req, res)
 *
 * Purpose: Create a new workflow
 * Body: { name, description, nodes, edges, settings }
 * Process:
 *   - Create Workflow with userId = req.user.uid
 *   - Set isActive = false by default
 *   - Log creation event
 * Response: Created workflow (201)
 */
export const createWorkflow = async (req, res) => {
  try {
    const { name, description, nodes, edges, settings } = req.body;
    const userId = req.user.uid;

    if (!name || !description || !nodes) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const workflowData = {
      userId,
      name,
      description: description || "",
      nodes: nodes || [],
      edges: edges || [],
      isActive: false,
    };

    const workflow = await Workflow.create(workflowData);

    res.status(201).json({
      success: true,
      data: workflow,
      message: "Workflow created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * 4. PUT /api/workflows/:id
 * updateWorkflow(req, res)
 *
 * Purpose: Update an existing workflow
 * Params: req.params.id
 * Body: { name, description, nodes, edges, settings }
 * Process:
 *   - Find workflow by ID and userId
 *   - Update fields
 *   - If active, may need to reschedule (call workflowExecutor.rescheduleWorkflow)
 *   - Log update event
 * Response: Updated workflow
 */
export const updateWorkflow = async (req, res) => {
  try {
    const workflowId = req.params.id;
    const userId = req.user.uid;
    const { name, description, nodes, edges, settings } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (nodes !== undefined) updateData.nodes = nodes;
    if (edges !== undefined) updateData.edges = edges;

    const workflow = await workflow.findoneAndUpdate({ _id: workflowId, userId }, updateData, {
      new: true,
    });

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: "Workflow not found",
      });
    }

    res.status(200).json({
      success: true,
      data: workflow,
      message: "Workflow updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * 5. DELETE /api/workflows/:id
 * deleteWorkflow(req, res)
 *
 * Purpose: Delete a workflow
 * Params: req.params.id
 * Process:
 *   - Find workflow by ID and userId
 *   - If active, deactivate first (unschedule cron jobs)
 *   - Delete workflow
 *   - Optionally delete associated executions
 *   - Log deletion event
 * Response: Success message
 */
export const deleteWorkflow = async (req, res) => {
  try{
    const workflowId = req.params.id;
    const userId = req.user.uid;

    const workflow = Workflow.findOne({
      _id: workflowId,
      userId
    });

    if(!workflow){
      return res.status(404).json({
        success:false,
        error:"Workflow not found"
      })
    }

    if(workflow.isActive){
      workflow.isActive = false;
      await workflow.save();
    }

    await Workflow.findByIdAndDelete(workflowId);

    res.status(200).json({
      success:true,
      message:"Workflow deleted successfully"
    });

  } catch(error){
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
};

/**
 * 6. POST /api/workflows/:id/activate
 * activateWorkflow(req, res)
 *
 * Purpose: Activate a workflow (start cron jobs)
 * Params: req.params.id
 * Process:
 *   - Find workflow by ID and userId
 *   - Check if workflow has trigger nodes
 *   - Call workflowExecutor.scheduleWorkflow(workflow)
 *   - Set workflow.isActive = true
 *   - Log activation event
 * Response: Updated workflow with isActive = true
 */
export const activateWorkflow = async (req, res) => {
  res.status(501).json({
    error: "Not implemented",
    message: "activateWorkflow needs to be implemented",
    hint: "Validate triggers exist, call workflowExecutor.scheduleWorkflow(workflow)",
  });
};

/**
 * 7. POST /api/workflows/:id/deactivate
 * deactivateWorkflow(req, res)
 *
 * Purpose: Deactivate a workflow (stop cron jobs)
 * Params: req.params.id
 * Process:
 *   - Find workflow by ID and userId
 *   - Call workflowExecutor.unscheduleWorkflow(workflowId)
 *   - Set workflow.isActive = false
 *   - Log deactivation event
 * Response: Updated workflow with isActive = false
 */
export const deactivateWorkflow = async (req, res) => {
  res.status(501).json({
    error: "Not implemented",
    message: "deactivateWorkflow needs to be implemented",
    hint: "Call workflowExecutor.unscheduleWorkflow(workflowId)",
  });
};

/**
 * 8. POST /api/workflows/:id/execute
 * executeWorkflow(req, res)
 *
 * Purpose: Manually execute a workflow (test run)
 * Params: req.params.id
 * Body: { triggerNodeId } (optional - which trigger to simulate)
 * Process:
 *   - Find workflow by ID and userId
 *   - Create new Execution record
 *   - Call workflowExecutor.executeWorkflow(workflow, triggerNodeId)
 *   - Return execution result
 * Response: Execution object with results
 */
export const executeWorkflow = async (req, res) => {
  res.status(501).json({
    error: "Not implemented",
    message: "executeWorkflow needs to be implemented",
    hint: "Create Execution, call workflowExecutor.executeWorkflow(workflow)",
  });
};

/**
 * 9. GET /api/workflows/:id/executions
 * getWorkflowExecutions(req, res)
 *
 * Purpose: Get execution history for a workflow
 * Params: req.params.id
 * Query params:
 *   - limit (default: 50)
 *   - offset (default: 0)
 *   - status (optional): 'success', 'error', 'running'
 * Response: Array of executions sorted by startedAt desc
 */
export const getWorkflowExecutions = async (req, res) => {
  res.status(501).json({
    error: "Not implemented",
    message: "getWorkflowExecutions needs to be implemented",
    hint: "Find Executions by workflowId with pagination",
  });
};
