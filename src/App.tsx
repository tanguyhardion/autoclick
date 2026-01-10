import { useState, useEffect } from "react";
import "./App.css";

const getBackendUrl = (): string => {
  return import.meta.env.DEV
    ? "http://localhost:3001" // Local backend for development
    : "https://autoclick-backend.vercel.app"; // Production backend
};

const API_BASE = getBackendUrl();

function App() {
  const [password, setPassword] = useState(() => localStorage.getItem("masterPassword") || "");
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const savePassword = (val: string) => {
    setPassword(val);
    localStorage.setItem("masterPassword", val);
  };

  useEffect(() => {
    if (!password) return;
    
    // Poll every 2 seconds
    const interval = setInterval(async () => {
      try {
        const url = new URL(`${API_BASE}/api/status`);
        url.searchParams.append("masterPassword", password);

        const res = await fetch(url.toString());
        const json = await res.json();
        
        if (json.success) {
            setStatus(json.data);
            setError("");
        } else {
            // handle auth error silently or log
            if (res.status === 401) setError("Invalid Password");
        }
      } catch (err) {
        // console.error(err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [password]);

  const sendControl = async (action: "START" | "STOP" | "CONTINUE") => {
    setLoading(true);
    try {
        const res = await fetch(`${API_BASE}/api/control`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                masterPassword: password,
                action
            })
        });
        const json = await res.json();
        if (json.success) {
            setStatus(json.data);
        } else {
            alert(json.error);
        }
    } catch (e: any) {
        alert(e.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Autoclicker Dashboard</h1>

      <div className="card">
        <label>
          Master Password:
          <input
            type="password"
            value={password}
            onChange={(e) => savePassword(e.target.value)}
            placeholder="Enter Master Password"
            style={{ marginLeft: "10px", padding: "5px" }}
          />
        </label>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      {status ? (
        <div className="dashboard">
          <div className="stat-box">
            <h2>Status</h2>
            <div className={`status-badge ${status.status.toLowerCase()}`}>
              {status.status}
            </div>
          </div>

          <div className="stat-box">
            <h2>Current Level</h2>
            <div className="stat-value">{status.current_level}</div>
          </div>

          <div className="stat-box">
            <h2>Total Completed</h2>
            <div className="stat-value">{status.total_levels_completed}</div>
          </div>

          <div className="controls">
            <button
              onClick={() => sendControl("START")}
              disabled={loading || status.status === "RUNNING"}
              className="btn start"
            >
              Start
            </button>
            <button
              onClick={() => sendControl("STOP")}
              disabled={loading || status.status === "STOPPED"}
              className="btn stop"
            >
              Stop
            </button>
            <button
              onClick={() => sendControl("CONTINUE")}
              disabled={loading || status.status === "RUNNING"}
              className="btn continue"
            >
              Continue
            </button>
          </div>
        </div>
      ) : (
        <p>Waiting for status...</p>
      )}
    </div>
  );
}

export default App;
