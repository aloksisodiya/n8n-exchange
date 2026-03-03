import { useRef, useEffect } from "react";

const LOG_STYLES = {
  info: { color: "#60a5fa", icon: "ℹ" },
  success: { color: "#34d399", icon: "✓" },
  warn: { color: "#fbbf24", icon: "⚠" },
  error: { color: "#f87171", icon: "✗" },
  system: { color: "#a78bfa", icon: "◈" },
  trade: { color: "#f59e0b", icon: "◆" },
};

function LogEntry({ log }) {
  const style = LOG_STYLES[log.type] || LOG_STYLES.info;
  return (
    <div
      style={{
        display: "flex",
        gap: 7,
        padding: "4px 0",
        borderBottom: "1px solid #0f1319",
        alignItems: "flex-start",
        animation: "slideInRight 0.15s ease",
      }}
    >
      <span
        style={{
          color: "var(--text-primary)",
          fontSize: 9,
          fontFamily: "var(--font-mono)",
          whiteSpace: "nowrap",
          paddingTop: 2,
          flexShrink: 0,
          opacity: 0.6,
        }}
      >
        {log.time}
      </span>
      <span
        style={{
          color: style.color,
          fontSize: 10,
          paddingTop: 2,
          flexShrink: 0,
        }}
      >
        {style.icon}
      </span>
      <span
        style={{
          color: "#b0bec5",
          fontSize: 10,
          fontFamily: "var(--font-mono)",
          lineHeight: 1.6,
          wordBreak: "break-word",
        }}
      >
        {log.msg}
      </span>
    </div>
  );
}

export default function LogPanel({ logs, onClear }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div
      style={{
        width: 300,
        background: "var(--bg-surface)",
        borderLeft: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--accent-purple)",
              boxShadow: "0 0 6px var(--accent-purple)",
              animation: "pulse-dot 2s ease-in-out infinite",
            }}
          />
          <span
            style={{
              color: "var(--text-secondary)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.5,
            }}
          >
            EXECUTION LOG
          </span>
          <span
            style={{
              background: "var(--bg-base)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              borderRadius: 10,
              padding: "0 6px",
              fontSize: 9,
              fontWeight: 600,
              opacity: 0.7,
            }}
          >
            {logs.length}
          </span>
        </div>
        <button
          onClick={onClear}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-secondary)",
            fontSize: 9,
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            letterSpacing: 1,
            fontWeight: 600,
          }}
        >
          CLEAR
        </button>
      </div>

      {/* Log entries */}
      <div style={{ flex: 1, overflowY: "auto", padding: "6px 12px" }}>
        {logs.length === 0 ? (
          <div
            style={{
              color: "var(--text-secondary)",
              fontSize: 10,
              marginTop: 20,
              textAlign: "center",
            }}
          >
            No logs yet.
          </div>
        ) : (
          logs.map((log) => <LogEntry key={log.id} log={log} />)
        )}
        <div ref={endRef} />
      </div>

      {/* Legend */}
      <div
        style={{
          padding: "8px 12px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        {Object.entries(LOG_STYLES).map(([type, s]) => (
          <div
            key={type}
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <span style={{ color: s.color, fontSize: 9 }}>{s.icon}</span>
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: 8,
                fontFamily: "var(--font-mono)",
              }}
            >
              {type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
