/* @refresh reset */
import { createContext, useContext, useState, useCallback } from "react";
import { timestamp, genId } from "../utils/helpers";

const WorkflowContext = createContext(null);

export const useWorkflow = () => {
  const ctx = useContext(WorkflowContext);
  if (!ctx) throw new Error("useWorkflow must be used inside WorkflowProvider");
  return ctx;
};

export function WorkflowProvider({ children }) {
  // ── Logs ──────────────────────────────────────────────────────────────────
  const [logs, setLogs] = useState([
    {
      id: genId("log"),
      time: timestamp(),
      msg: "TradeFlow system ready.",
      type: "system",
    },
    {
      id: genId("log"),
      time: timestamp(),
      msg: "Open a workflow or create a new one to get started.",
      type: "system",
    },
  ]);

  const addLog = useCallback((msg, type = "info") => {
    setLogs((prev) => [
      ...prev.slice(-299),
      { id: genId("log"), time: timestamp(), msg, type },
    ]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([
      {
        id: genId("log"),
        time: timestamp(),
        msg: "Logs cleared.",
        type: "system",
      },
    ]);
  }, []);

  // ── All saved workflows (empty by default - will be loaded from backend) ──
  const [workflows, setWorkflows] = useState([])

  // ── Workflow CRUD ─────────────────────────────────────────────────────────
  const saveWorkflow = useCallback(
    (workflow) => {
      setWorkflows((prev) => {
        const idx = prev.findIndex((w) => w.id === workflow.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...prev[idx], ...workflow };
          return updated;
        }
        return [...prev, workflow];
      });
      addLog(`Workflow "${workflow.name}" saved.`, "success");
    },
    [addLog],
  );

  const deleteWorkflow = useCallback(
    (id) => {
      setWorkflows((prev) => {
        const wf = prev.find((w) => w.id === id);
        if (wf) addLog(`Workflow "${wf.name}" deleted.`, "warn");
        return prev.filter((w) => w.id !== id);
      });
    },
    [addLog],
  );

  const toggleWorkflow = useCallback(
    (id) => {
      setWorkflows((prev) =>
        prev.map((w) => {
          if (w.id !== id) return w;
          const next = !w.isActive;
          addLog(
            next
              ? `Workflow "${w.name}" ACTIVATED — executor now running.`
              : `Workflow "${w.name}" DEACTIVATED — executor stopped.`,
            next ? "success" : "warn",
          );
          return { ...w, isActive: next };
        }),
      );
    },
    [addLog],
  );

  // ── Mock execution history ────────────────────────────────────────────────
  const [executions] = useState([
    {
      id: "ex-1",
      workflowId: "wf-demo-1",
      workflowName: "DCA SOL Bot",
      nodeType: "spotBuy",
      asset: "SOL",
      qty: 0.01,
      price: 148.2,
      status: "success",
      timestamp: new Date(Date.now() - 300000).toISOString(),
    },
    {
      id: "ex-2",
      workflowId: "wf-demo-1",
      workflowName: "DCA SOL Bot",
      nodeType: "spotBuy",
      asset: "SOL",
      qty: 0.01,
      price: 149.1,
      status: "success",
      timestamp: new Date(Date.now() - 9300000).toISOString(),
    },
    {
      id: "ex-3",
      workflowId: "wf-demo-2",
      workflowName: "SOL Stop Loss Guard",
      nodeType: "spotSell",
      asset: "SOL",
      qty: 0.05,
      price: 143.8,
      status: "success",
      timestamp: new Date(Date.now() - 18600000).toISOString(),
    },
    {
      id: "ex-4",
      workflowId: "wf-demo-1",
      workflowName: "DCA SOL Bot",
      nodeType: "spotBuy",
      asset: "SOL",
      qty: 0.01,
      price: 151.0,
      status: "failure",
      timestamp: new Date(Date.now() - 27900000).toISOString(),
    },
    {
      id: "ex-5",
      workflowId: "wf-demo-2",
      workflowName: "SOL Stop Loss Guard",
      nodeType: "sendEmail",
      asset: "SOL",
      qty: 0,
      price: 0,
      status: "success",
      timestamp: new Date(Date.now() - 37200000).toISOString(),
    },
  ]);
  // ── Execution history (empty by default - will be loaded from backend) ────

  return (
    <WorkflowContext.Provider
      value={{
        logs,
        addLog,
        clearLogs,
        workflows,
        saveWorkflow,
        deleteWorkflow,
        toggleWorkflow,
        executions,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}
