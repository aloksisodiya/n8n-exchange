import { Router } from 'express';
import { authMiddleware } from '../controllers/auth.controllers.js';
import {
  getAllWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  activateWorkflow,
  deactivateWorkflow,
  executeWorkflow,
  getWorkflowExecutions,
} from '../controllers/workflow.controllers.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Workflow CRUD
router.get('/', getAllWorkflows);
router.get('/:id', getWorkflowById);
router.post('/', createWorkflow);
router.put('/:id', updateWorkflow);
router.delete('/:id', deleteWorkflow);

// Workflow actions
router.post('/:id/activate', activateWorkflow);
router.post('/:id/deactivate', deactivateWorkflow);
router.post('/:id/execute', executeWorkflow);

// Workflow executions
router.get('/:id/executions', getWorkflowExecutions);

export default router;
