import { useState, useEffect } from "react";
import { PasswordModal } from "./components/PasswordModal";
import { StatBox } from "./components/StatBox";
import { ControlPanel } from "./components/ControlPanel";
import { ScreenshotViewer } from "./components/ScreenshotViewer";
import { LogsViewer } from "./components/LogsViewer";

const getBackendUrl = (): string => {
  return import.meta.env.DEV
    ? "http://localhost:3001" // Local backend for development
    : "https://autoclick-backend.vercel.app"; // Production backend
};

const API_BASE = getBackendUrl();

function App() {
  const [password, setPassword] = useState(() => sessionStorage.getItem("masterPassword") || "");
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [targetLevel, setTargetLevel] = useState<number | null>(null); // null = loading, 0 = unlimited

  useEffect(() => {
    if (password) {
      setIsAuth(true);
    }
  }, [password]);

  // Fetch targetLevel from database on first load after authentication
  useEffect(() => {
    if (!password || targetLevel !== null) return; // Only fetch once on auth
    
    const fetchTargetLevel = async () => {
      try {
        const url = new URL(`${API_BASE}/api/status`);
        url.searchParams.append("masterPassword", password);
        const res = await fetch(url.toString());
        
        if (res.status === 401) {
          setIsAuth(false);
          setPassword("");
          sessionStorage.removeItem("masterPassword");
          return;
        }
        
        const json = await res.json();
        if (json.success && json.data.target_level !== undefined) {
          setTargetLevel(json.data.target_level);
        } else {
          setTargetLevel(0); // Default to no limit
        }
      } catch (err) {
        console.error("Error fetching target level:", err);
        setTargetLevel(0); // Default to no limit on error
      }
    };
    
    fetchTargetLevel();
  }, [password]);

  const handleLogin = (val: string) => {
    setPassword(val);
    sessionStorage.setItem("masterPassword", val);
    setIsAuth(true);
  };

  // Turn off screenshot loading when new screenshot arrives
  useEffect(() => {
    if (screenshotLoading && status?.latest_screenshot_at) {
      setScreenshotLoading(false);
    }
  }, [status?.latest_screenshot_at]);

  useEffect(() => {
    if (!password) return;
    
    // Poll every 2 seconds
    const interval = setInterval(async () => {
      try {
        const url = new URL(`${API_BASE}/api/status`);
        url.searchParams.append("masterPassword", password);

        const res = await fetch(url.toString());
        
        if (res.status === 401) {
             setIsAuth(false);
             setPassword("");
             sessionStorage.removeItem("masterPassword");
             return;
        }

        const json = await res.json();
        
        if (json.success) {
            setStatus(json.data);
            // Sync target level from backend if not set locally yet or to keep in sync?
            // Usually local override is better, but seeing current server setting is good.
            // Let's only set it if we haven't touched it? Or just let user overwrite.
            // For now, let's not auto-update targetLevel from backend to avoid input jumping while typing.
            // But we could display the "Current Target" in StatBox.
        }
      } catch (err) {
        // console.error(err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [password]);

  const sendControl = async (action: "START" | "STOP" | "CONTINUE") => {
    setLoading(true);
    try {
        const payload: any = {
            masterPassword: password,
            action
        };
        // Include targetLevel for START/CONTINUE
        if (action === "START" || action === "CONTINUE") {
            payload.targetLevel = targetLevel;
        }

        const res = await fetch(`${API_BASE}/api/control`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
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


  const requestScreenshot = async () => {
    setScreenshotLoading(true);
    try {
        const res = await fetch(`${API_BASE}/api/control/screenshot`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                masterPassword: password
            })
        });
        const json = await res.json();
        if (!json.success) {
            alert(json.error);
            setScreenshotLoading(false);
        }
        // Keep loading state until new screenshot arrives (via polling)
    } catch (e: any) {
        alert(e.message);
        setScreenshotLoading(false);
    }
  };

  if (!isAuth) {
      return <PasswordModal onSuccess={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 font-sans text-slate-100">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
             <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Autoclicker Dashboard</h1>
                <p className="text-slate-400 mt-1">Monitor and control your automation bot</p>
             </div>
             <div className="flex items-center gap-3">
                 <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-sm border ${status ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${status ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                    {status ? 'System Online' : 'Connecting...'}
                 </div>
             </div>
        </header>

        {status ? (
            <main className="space-y-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatBox 
                        title="Status" 
                        value={status.status} 
                        variant="status" 
                    />
                    <StatBox 
                        title="Current Level" 
                        value={status.current_level} 
                    />
                    <StatBox 
                        title="Total Completed" 
                        value={status.total_levels_completed} 
                    />
                </div>

                {targetLevel !== null && (
                    <ControlPanel 
                        onStart={() => sendControl("START")}
                        onStop={() => sendControl("STOP")}
                        onContinue={() => sendControl("CONTINUE")}
                        onScreenshot={requestScreenshot}
                        loading={loading}
                        screenshotLoading={screenshotLoading}
                        status={status.status}
                        targetLevel={targetLevel}
                        setTargetLevel={setTargetLevel}
                    />
                )}

                <div className="w-full">
                    <ScreenshotViewer 
                        src={status.latest_screenshot_data} 
                        timestamp={status.latest_screenshot_at}
                        loading={screenshotLoading}
                    />
                </div>
                
                <div className="w-full">
                    <LogsViewer 
                        apiBase={API_BASE}
                        password={password}
                    />
                </div>
            </main>
        ) : (
            <div className="flex flex-col items-center justify-center py-32 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm">
                <div className="relative mb-6">
                    <div className="w-16 h-16 border-4 border-slate-800 border-t-primary-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-slate-800 rounded-full"></div>
                    </div>
                </div>
                <h3 className="text-lg font-bold text-white">Connecting to Bot</h3>
                <p className="text-slate-500 mt-1 animate-pulse">Waiting for status signal...</p>
            </div>
        )}

      </div>
    </div>
  );
}

export default App;
