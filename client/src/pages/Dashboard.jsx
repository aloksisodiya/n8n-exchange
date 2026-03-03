import { Link } from "react-router-dom";
import { useWorkflow } from "../context/WorkflowContext";
import Topbar from "../components/Topbar/Topbar";
import { formatDate } from "../utils/helpers";
import { NODE_TYPES } from "../constants/nodeTypes";

function StatCard({ label, value, color, icon }) {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: `1px solid ${color}33`,
        borderRadius: "var(--radius-md)",
        padding: "18px 22px",
        flex: 1,
      }}
    >
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div
        style={{
          color,
          fontSize: 28,
          fontWeight: 700,
          fontFamily: "var(--font-display)",
        }}
      >
        {value}
      </div>
      <div
        style={{
          color: "var(--text-primary)",
          fontSize: 11,
          marginTop: 4,
          opacity: 0.7,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function WorkflowCard({ workflow, onToggle, onDelete }) {
  const isActive = workflow.isActive;

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: `1px solid ${isActive ? "var(--accent-green)33" : "var(--border)"}`,
        borderRadius: "var(--radius-md)",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        transition: "border-color 0.2s",
        animation: "fadeIn 0.2s ease",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            {isActive && (
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--accent-green)",
                  boxShadow: "0 0 6px var(--accent-green)",
                  animation: "pulse-dot 1.5s ease-in-out infinite",
                  flexShrink: 0,
                }}
              />
            )}
            <h3
              style={{
                color: "var(--text-primary)",
                fontSize: 15,
                fontFamily: "var(--font-display)",
                fontWeight: 700,
              }}
            >
              {workflow.name}
            </h3>
          </div>
          <div
            style={{ color: "var(--text-primary)", fontSize: 10, opacity: 0.6 }}
          >
            Created {formatDate(workflow.createdAt)}
          </div>
        </div>
        <div
          style={{
            background: isActive ? "#14532d" : "var(--bg-base)",
            border: `1px solid ${isActive ? "var(--accent-green)" : "var(--border)"}`,
            color: isActive ? "var(--accent-green)" : "var(--text-secondary)",
            borderRadius: 20,
            padding: "3px 12px",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          {isActive ? "▶ RUNNING" : "◼ IDLE"}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 20 }}>
        {[
          {
            label: "NODES",
            val: workflow.nodes?.length || 0,
            color: "var(--accent-blue)",
          },
          {
            label: "EDGES",
            val: workflow.edges?.length || 0,
            color: "var(--accent-purple)",
          },
          {
            label: "EXECUTIONS",
            val: workflow.executions || 0,
            color: "var(--accent-yellow)",
          },
        ].map((s) => (
          <div key={s.label}>
            <div style={{ color: s.color, fontSize: 16, fontWeight: 700 }}>
              {s.val}
            </div>
            <div
              style={{
                color: "var(--text-primary)",
                fontSize: 9,
                letterSpacing: 1,
                fontWeight: 600,
                opacity: 0.8,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
        {workflow.lastRun && (
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ color: "var(--text-secondary)", fontSize: 10 }}>
              Last run
            </div>
            <div
              style={{
                color: "var(--text-primary)",
                fontSize: 10,
                opacity: 0.7,
              }}
            >
              {formatDate(workflow.lastRun)}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: "flex",
          gap: 8,
          borderTop: "1px solid var(--border)",
          paddingTop: 12,
        }}
      >
        <Link to={`/builder/${workflow.id}`} style={{ flex: 1 }}>
          <button
            style={{
              width: "100%",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              padding: "7px 0",
              borderRadius: "var(--radius-sm)",
              fontSize: 11,
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
            }}
          >
            ✎ Open Editor
          </button>
        </Link>
        <button
          onClick={() => onToggle(workflow.id)}
          style={{
            flex: 1,
            background: isActive ? "#14532d" : "#0f2518",
            border: `1px solid ${isActive ? "var(--accent-green)" : "#166534"}`,
            color: "var(--accent-green)",
            padding: "7px 0",
            borderRadius: "var(--radius-sm)",
            fontSize: 11,
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
          }}
        >
          {isActive ? "◼ Deactivate" : "▶ Activate"}
        </button>
        <Link to={`/executions?workflow=${workflow.id}`}>
          <button
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
              padding: "7px 14px",
              borderRadius: "var(--radius-sm)",
              fontSize: 11,
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
            }}
          >
            ◎ History
          </button>
        </Link>
        <button
          onClick={() => onDelete(workflow.id)}
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            color: "var(--accent-red)",
            padding: "7px 14px",
            borderRadius: "var(--radius-sm)",
            fontSize: 11,
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { workflows, toggleWorkflow, deleteWorkflow } = useWorkflow();

  const activeCount = workflows.filter((w) => w.isActive).length;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Topbar />

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "28px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        {/* Page title */}
        <div>
          <h1
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-display)",
              fontSize: 24,
              fontWeight: 800,
              marginBottom: 4,
            }}
          >
            Dashboard
          </h1>
          <p
            style={{ color: "var(--text-primary)", fontSize: 12, opacity: 0.7 }}
          >
            Manage your automated trading workflows
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 16 }}>
          <StatCard
            label="Total Workflows"
            value={workflows.length}
            color="var(--accent-blue)"
            icon="⬡"
          />
          <StatCard
            label="Active Now"
            value={activeCount}
            color="var(--accent-green)"
            icon="▶"
          />
        </div>

        {/* Workflows grid */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h2
              style={{
                color: "var(--text-secondary)",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              YOUR WORKFLOWS ({workflows.length})
            </h2>
          </div>

          {workflows.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 0",
                color: "var(--text-secondary)",
                fontSize: 13,
                border: "1px dashed var(--border)",
                borderRadius: "var(--radius-lg)",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3 }}>
                ⚡
              </div>
              No workflows yet.{" "}
              <Link to="/builder/new" style={{ color: "var(--accent-yellow)" }}>
                Create your first one →
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: 16,
              }}
            >
              {workflows.map((wf) => (
                <WorkflowCard
                  key={wf.id}
                  workflow={wf}
                  onToggle={toggleWorkflow}
                  onDelete={deleteWorkflow}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick-start guide */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "20px 24px",
          }}
        >
          <h3
            style={{
              color: "var(--text-secondary)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1,
              marginBottom: 16,
            }}
          >
            QUICK START — COMMON WORKFLOWS
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 10,
            }}
          >
            {[
              {
                name: "DCA Bot",
                desc: "Timer → Spot Buy",
                icon: "⏱",
                color: "#f59e0b",
              },
              {
                name: "Stop Loss Guard",
                desc: "Price Below → Spot Sell",
                icon: "🛑",
                color: "#f97316",
              },
              {
                name: "Take Profit",
                desc: "Price Above → Spot Sell",
                icon: "🎯",
                color: "#06b6d4",
              },
              {
                name: "Leverage Long",
                desc: "Price Below → Long",
                icon: "⬆",
                color: "#22c55e",
              },
              {
                name: "Hedge Strategy",
                desc: "Price Below → Long + Short",
                icon: "◎",
                color: "#818cf8",
              },
              {
                name: "Alert Bot",
                desc: "Timer → Telegram",
                icon: "📨",
                color: "#38bdf8",
              },
            ].map((template) => (
              <Link to="/builder/new" key={template.name}>
                <div
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    padding: "10px 14px",
                    cursor: "pointer",
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = template.color)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border)")
                  }
                >
                  <div style={{ fontSize: 16, marginBottom: 4 }}>
                    {template.icon}
                  </div>
                  <div
                    style={{
                      color: "var(--text-primary)",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {template.name}
                  </div>
                  <div
                    style={{
                      color: "var(--text-primary)",
                      fontSize: 10,
                      marginTop: 2,
                      opacity: 0.7,
                    }}
                  >
                    {template.desc}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
